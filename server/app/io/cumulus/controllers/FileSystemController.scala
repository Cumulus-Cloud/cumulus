package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import akka.actor.ActorSystem
import akka.stream._
import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.controllers.payloads.fs._
import io.cumulus.controllers.utils.FileDownloader
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import io.cumulus.core.stream.storage.FileWriter
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.core.utils.Range
import io.cumulus.models.UserSession
import io.cumulus.models.fs.Directory
import io.cumulus.persistence.services.{FsNodeService, SharingService}
import io.cumulus.persistence.storage.{LocalStorageEngine, StorageEngine}
import play.api.mvc.{AbstractController, ControllerComponents}

class FileSystemController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  sharingService: SharingService
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with FileDownloader with BodyParserJson with BodyParserStream {

  // TODO inject
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // TODO inject
  val storageEngine: StorageEngine = new LocalStorageEngine()

  // TODO generate by user
  // TODO also, derivate the private key from the user's clear password
  val key = "CJkI5LEy+Jtxi/0Dd8/1GA==" // Crypto.randomKey("AES", 128)
  val salt = "DQG+ivnNsojhm1SxDIkg5A==" // Crypto.randomSalt(16)

  def get(path: String) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.findNode(path)
    }
  }

  def stream(path: String) = AuthenticatedAction.async { implicit request =>

    // TODO duplicated
    val headerRange: (Long, Long) =
      request.headers.get("Range").getOrElse("bytes=0-").split('=').toList match {
        case "bytes" :: r :: Nil => r.split('-').map(_.toLong).toList match {
          case from :: to :: Nil => (from, to)
          case from :: Nil => (from, -1)
          case _ => (0, -1)
        }
        case _ => (0, -1)
      }

    fsNodeService.findFile(path).map {
      case Right(file) =>

        val realRange = (headerRange._1, if(headerRange._2 > 0) headerRange._2 else file.size - 1 ) // TODO check validity & return 406 if not
        val range = Range(realRange._1, realRange._2)

        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(key, salt).get)
            .via(Compression.gunzip())

        streamFile(storageEngine, file, transformation, range)

      case Left(e) =>
        toApiError(e)
    }
  }

  def download(path: String, forceDownload: Option[Boolean]) = AuthenticatedAction.async { implicit request =>

    fsNodeService.findFile(path).map {
      case Right(file) =>

        // TODO guess from the file and/or chunks
        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(key, salt).get)
            .via(Compression.gunzip())

        downloadFile(storageEngine, file, transformation, forceDownload.getOrElse(false))

      case Left(e) =>
        toApiError(e)
    }
  }

 def upload(path: String) = AuthenticatedAction.async(streamBody) { implicit request =>
   ApiResponse {
     // Check that the file can be uploaded
     fsNodeService.checkForNewNode(path).flatMap {
       case Right(_) =>

         // TODO get info from conf and/or user
         val chunkSize = 8096
         val objectSize = 8096 * 10000 // ~ 60Mo

         // TODO get from conf and/or user
         val transformation =
           Flow[ByteString]
             .via(Compression.gzip)
             .via(AESCipher.encrypt(key, salt).get)

         val fileWriter =
           FileWriter(
             storageEngine,
             transformation,
             path,
             objectSize,
             chunkSize
           )

         request
           .body
           .runWith(fileWriter)
           .flatMap { uploadedFile =>
             // Once uploaded, insert the created file
             // TODO should delete stored objects on failure (or at least mark them as deletable)
             fsNodeService
               .createFile(uploadedFile)
           }

       case Left(e) =>
         Future.successful(Left(e))
     }

   }
 }

  // Only for test
  def tree = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.tree.map(_.map(_.map(_.path.toString)))
    }
  }

  def create(path: String) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      val directory = Directory(request.user.id, path)
      fsNodeService.createDirectory(directory)
    }
  }

  def update(path: String) = AuthenticatedAction.async(parseJson[FsOperation]) { implicit request =>
    request.body match {
      case FsOperationCreate(_) =>
        val directory = Directory(request.user.id, path)
        ApiResponse(fsNodeService.createDirectory(directory))
      case FsOperationMove(to) =>
        ApiResponse(fsNodeService.moveNode(path, to))
      case FsOperationShareLink(password, duration, needAuth) =>
        ApiResponse(sharingService.shareNode(path, duration, password, needAuth.getOrElse(false)))
      case FsOperationDelete(_) =>
        ApiResponse(fsNodeService.deleteNode(path))
    }
  }

  def delete(path: String) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.deleteNode(path)
    }
  }

}

