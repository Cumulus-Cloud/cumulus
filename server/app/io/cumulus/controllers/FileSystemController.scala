package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.payloads.fs._
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.{BodyParserJson, BodyParserStream}
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.{Directory, FsNodeType}
import io.cumulus.models.{Path, Sharing, UserSession}
import io.cumulus.persistence.services.{FsNodeService, SharingService, StorageService}
import io.cumulus.stages._
import play.api.libs.json.{JsString, Json}
import play.api.mvc.{AbstractController, ControllerComponents}

class FileSystemController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  storageService: StorageService,
  sharingService: SharingService
)(implicit
  ec: ExecutionContext,
  ciphers: Ciphers,
  compressions: Compressions
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
        // Get the file
        file       <- EitherT(fsNodeService.findFile(path))

        // Get the file's content
        maybeRange <- EitherT.fromEither[Future](headerRange(request, file))
        content    <- EitherT(storageService.downloadFile(path, maybeRange))

        // Create the response
        result <- EitherT.pure[Future, AppError](
          maybeRange match {
            case Some(range) =>
              streamFile(file, content, range)
            case None =>
              downloadFile(file, content, forceDownload.getOrElse(false))
          }
        )
      } yield result
    }
  }

  def downloadThumbnail(path: Path, forceDownload: Option[Boolean]) = AuthenticatedAction.async { implicit request =>
    ApiResponse.result {
      for {
        // Get the file
        file    <- EitherT(fsNodeService.findFile(path))

        // Get the file thumbnail's content
        content <- EitherT(storageService.downloadThumbnail(path))

        // Create the response
        result  <- EitherT.pure[Future, AppError]{
          file.thumbnailStorageReference match {
            case Some(thumbnailStorageReference) =>
              downloadFile(
                s"thumbnail_${file.name}",
                thumbnailStorageReference.size,
                ThumbnailGenerator.thumbnailMimeType,
                content,
                forceDownload.getOrElse(false)
              )
            case _ =>
              // Should never happen
              toApiError(AppError.notFound("validation.fs-node.no-thumbnail", file.name))
          }
        }

      } yield result
    }
  }

 def upload(path: Path, cipherName: Option[String], compressionName: Option[String]) = AuthenticatedAction.async(streamBody) { implicit request =>
   ApiResponse {
     for {
       // Get the cipher and compression from the request
       cipher      <- EitherT.fromEither[Future](ciphers.get(cipherName))
       compression <- EitherT.fromEither[Future](compressions.get(compressionName))

       // Upload & create the file
       file <- EitherT(storageService.uploadFile(path, cipher, compression, request.body))

     } yield file
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

