package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import akka.stream.Materializer
import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.payloads.fs._
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import io.cumulus.core.stream.storage.StorageReferenceWriter
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.{Directory, File, FileMetadata, FsNodeType}
import io.cumulus.models.{Path, Sharing, UserSession}
import io.cumulus.persistence.services.{FsNodeService, SharingService}
import io.cumulus.persistence.storage.StorageEngine
import io.cumulus.stages._
import play.api.libs.json.{JsString, Json}
import play.api.mvc.{AbstractController, ControllerComponents}

class FileSystemController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  sharingService: SharingService,
  storageEngine: StorageEngine
)(implicit
  ec: ExecutionContext,
  materializer: Materializer,
  settings: Settings,
  ciphers: Ciphers,
  compressions: Compressions,
  metadataExtractors: MetadataExtractors,
  thumbnailGenerators: ThumbnailGenerators
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with FileDownloaderUtils with BodyParserJson with BodyParserStream {

  def get(path: Path) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.findNode(path)
    }
  }

  def search(path: Path, name: String, nodeType: Option[FsNodeType], mimeType: Option[String]) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      fsNodeService.searchNodes(path, name, nodeType, mimeType)
    }
  }

  def download(path: Path, forceDownload: Option[Boolean]) = AuthenticatedAction.async { implicit request =>
    ApiResponse.result {
      for {
        file       <- EitherT(fsNodeService.findFile(path))
        maybeRange <- EitherT.fromEither[Future](headerRange(request, file))
        result     <- EitherT.fromEither[Future](
          maybeRange match {
            case Some(range) =>
              streamFile(storageEngine, file, range)
            case None =>
              downloadFile(storageEngine, file, forceDownload.getOrElse(false))
          }
        )
      } yield result
    }
  }

 def upload(path: Path, cipherName: Option[String], compressionName: Option[String]) = AuthenticatedAction.async(streamBody) { implicit request =>
   ApiResponse {
     for {
       // Check that the file can be uploaded
       _ <- EitherT(fsNodeService.checkForNewNode(path))

       // Get the cipher and compression from the request
       cipher      <- EitherT.fromEither[Future](ciphers.get(cipherName))
       compression <- EitherT.fromEither[Future](compressions.get(compressionName))

       // Define the file writer from this information
       fileWriter = {
         StorageReferenceWriter(
           storageEngine,
           cipher,
           compression,
           path
         )
       }

       // Store the file's content
       uploadedFile <- EitherT.liftF(request.body.runWith(fileWriter))

       // Extract metadata
       metadata          <- EitherT.fromEither[Future](extractMetadata(uploadedFile))
       fileWithMetadata  =  uploadedFile.copy(metadata = metadata)

       // Create an entry in the database for the file
       file <- EitherT(fsNodeService.createFile(fileWithMetadata))

       // Create a thumbnail (if possible) for the file
       thumbnail <- EitherT(generateThumbnail(file))

     } yield file
   }
 }

  private def extractMetadata(file: File)(implicit request: AuthenticatedRequest[_]): Either[AppError, FileMetadata] = {
    val metadataExtractor =  metadataExtractors.get(file.mimeType)

    metadataExtractor.extract(file, storageEngine)
  }

  private def generateThumbnail(file: File)(implicit request: AuthenticatedRequest[_]): Future[Either[AppError, Option[File]]] = {
    val thumbnailGenerator = thumbnailGenerators.get(file.mimeType)

    thumbnailGenerator.map { generator =>
      EitherT(generator.generate(file, storageEngine)).flatMap { thumbnail =>
        EitherT(fsNodeService.createFile(thumbnail)).map(Some(_))
      }
    }.getOrElse(EitherT.fromEither[Future](Right(None))).value
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
              Right(Json.toJsObject(sharing)(Sharing.apiWrite)
                + ("key" -> Json.toJson(secretCode))
                + ("download" -> JsString(routes.SharingController.downloadRoot(sharing.reference, path.name, secretCode, None).url))
                + ("path" -> JsString(routes.SharingController.get("/", sharing.reference, secretCode).url))
              )
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

