package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import akka.stream.Materializer
import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.controllers.payloads.fs._
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import io.cumulus.core.stream.storage.StorageReferenceWriter
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.models.fs.Directory
import io.cumulus.models.{Path, Sharing, UserSession}
import io.cumulus.persistence.services.{FsNodeService, SharingService}
import io.cumulus.persistence.storage.StorageEngine
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}

class FileSystemController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  sharingService: SharingService,
  storageEngine: StorageEngine
)(
  implicit ec: ExecutionContext,
  materializer: Materializer,
  settings: Settings
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with FileDownloaderUtils with BodyParserJson with BodyParserStream {

  def get(path: Path) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.findNode(path)
    }
  }

  def stream(path: Path) = AuthenticatedAction.async { implicit request =>
    fsNodeService.findFile(path).map {
      case Right(file) =>

        val range = headerRange(request, file)
        val (privateKey, salt) = request.user.privateKeyAndSalt

        // TODO guess from the file and/or chunks
        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(privateKey, salt))
            .via(Compression.gunzip())

        streamFile(storageEngine, file, transformation, range)

      case Left(e) =>
        toApiError(e)
    }
  }

  def download(path: Path, forceDownload: Option[Boolean]) = AuthenticatedAction.async { implicit request =>
    fsNodeService.findFile(path).map {
      case Right(file) =>

        val (privateKey, salt) = request.user.privateKeyAndSalt

        // TODO guess from the file and/or chunks
        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(privateKey, salt))
            .via(Compression.gunzip())

        downloadFile(storageEngine, file, transformation, forceDownload.getOrElse(false))

      case Left(e) =>
        toApiError(e)
    }
  }

 def upload(path: Path) = AuthenticatedAction.async(streamBody) { implicit request =>
   ApiResponse {
     // Check that the file can be uploaded
     fsNodeService.checkForNewNode(path).flatMap {
       case Right(_) =>

         val (privateKey, salt) = request.user.privateKeyAndSalt

         // TODO get from conf and/or file
         val transformation =
           Flow[ByteString]
             .via(Compression.gzip)
             .via(AESCipher.encrypt(privateKey, salt))

         val fileWriter =
           StorageReferenceWriter(
             storageEngine,
             transformation,
             path
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

  def create(path: Path) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      val directory = Directory.create(request.user.id, path)
      fsNodeService.createDirectory(directory)
    }
  }

  def update(path: Path) = AuthenticatedAction.async(parseJson[FsOperation]) { implicit request =>
    request.body match {
      case FsOperationCreate(_) =>
        val directory = Directory.create(request.user.id, path)
        ApiResponse(fsNodeService.createDirectory(directory))
      case FsOperationMove(to) =>
        ApiResponse(fsNodeService.moveNode(path, to))
      case FsOperationShareLink(_, duration, _) =>
        ApiResponse {
          sharingService.shareNode(path, request.user.password, duration).map {
            case Right((sharing, secretCode)) =>
              Right(Json.toJsObject(sharing)(Sharing.apiWrite) + ("key" -> Json.toJson(secretCode)))
            case Left(e) =>
              Left(e)
          }
        }
      case FsOperationDelete(_) =>
        ApiResponse(fsNodeService.deleteNode(path))
    }
  }

  def delete(path: Path) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.deleteNode(path)
    }
  }

}

