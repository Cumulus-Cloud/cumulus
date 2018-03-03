package io.cumulus.controllers

import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.utils.Base16
import io.cumulus.core.validation.AppError
import io.cumulus.models.{Path, SharingSession, UserSession}
import io.cumulus.persistence.services.{SharingService, StorageService}
import play.api.mvc.{AbstractController, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}

class SharingController(
  cc: ControllerComponents,
  sharingService: SharingService,
  storageService: StorageService
)(implicit
  ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with FileDownloaderUtils {

  def get(path: Path, reference: String, key: String) = Action.async { implicit request =>
    ApiResponse {
      sharingService.findSharedNode(reference, path, key).map {
        case Right((_, _, node)) =>
          Right(node)
        case Left(e) =>
          Left(e)
      }
    }
  }

  def list(path: Path) = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      sharingService.list(path)
    }
  }

  def downloadRoot(reference: String, name: String, key: String, forceDownload: Option[Boolean]) =
    download("/", reference, key, forceDownload)

  def download(path: Path, reference: String, key: String, forceDownload: Option[Boolean]) = Action.async { implicit request =>
    ApiResponse.result {
      for {
        // Get the sharing, the user and the file
        res <- EitherT(sharingService.findSharedFile(reference, path, key))
        (sharing, user, file) = res

        // Decode the key & generate a session
        decodedKey <- EitherT.fromEither[Future](Base16.decode(key).toRight(AppError.validation("validation.sharing.invalid-key")))
        session    =  SharingSession(user, sharing, decodedKey)

        // Get the file's content
        maybeRange <- EitherT.fromEither[Future](headerRange(request, file))
        content    <- EitherT.fromEither[Future](storageService.downloadFile(file, maybeRange)(session))

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

}
