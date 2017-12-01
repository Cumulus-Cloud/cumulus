package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.utils.Base16
import io.cumulus.core.validation.AppError
import io.cumulus.models.{Path, SharingSession}
import io.cumulus.persistence.services.SharingService
import io.cumulus.persistence.storage.StorageEngine
import io.cumulus.stages.{Ciphers, Compressions}
import play.api.mvc.{AbstractController, ControllerComponents}

class SharingController(
  cc: ControllerComponents,
  sharingService: SharingService,
  storageEngine: StorageEngine
)(implicit
  ec: ExecutionContext,
  ciphers: Ciphers,
  compressions: Compressions
) extends AbstractController(cc) with ApiUtils with FileDownloaderUtils {

  def get(path: Path, reference: String, key: String) = Action.async { implicit request =>
    ApiResponse {
      sharingService.findSharedNode(reference, path, key).map {
        case Right((_, _, node)) =>
          // TODO change the path to not return the node real path
          Right(node)
        case Left(e) =>
          Left(e)
      }
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

        // Get the range if a streaming is required
        maybeRange <- EitherT.fromEither[Future](headerRange(request, file))

        // Decode the key & generate a session
        decodedKey <- EitherT.fromEither[Future](Base16.decode(key).toRight(AppError.validation("validation.sharing.invalid-key")))
        session    =  SharingSession(user, sharing, decodedKey)

        // Download the file
        result <- EitherT.fromEither[Future]{
          implicit val sharingSession = session

          maybeRange match {
            case Some(range) =>
              streamFile(storageEngine, file, range)
            case None =>
              downloadFile(storageEngine, file, forceDownload.getOrElse(false))
          }
        }
      } yield result
    }
  }

}
