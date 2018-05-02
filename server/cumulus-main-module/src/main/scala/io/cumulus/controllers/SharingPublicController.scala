package io.cumulus.controllers

import cats.data.EitherT
import cats.implicits._
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.utils.Base16
import io.cumulus.core.validation.AppError
import io.cumulus.models.{Path, SharingSession, UserSession}
import io.cumulus.persistence.services.{SharingService, StorageService}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import scala.concurrent.{ExecutionContext, Future}

import com.github.ghik.silencer.silent
import io.cumulus.core.controllers.utils.FileDownloaderUtils

/**
  * Sharing visitor controller. This controller handle all the unauthenticated operation on shared elements.
  */
class SharingPublicController(
  cc: ControllerComponents,
  sharingService: SharingService,
  storageService: StorageService
)(implicit
  ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with FileDownloaderUtils {

  /**
    * Gets a sharing for an unauthenticated user.
    * @param path The paths within the sharing, '/' for the root element.
    * @param reference The reference of the sharing.
    * @param key The unique cipher key of the sharing.
    */
  def get(path: Path, reference: String, key: String): Action[AnyContent] = Action.async { implicit request =>
    ApiResponse {
      sharingService.findSharedNode(reference, path, key).map {
        case Right((_, _, node)) =>
          Right(node)
        case Left(e) =>
          Left(e)
      }
    }
  }

  /**
    * Downloads the root element of the sharing.
    * @param reference The reference of the sharing.
    * @param name The name of the sharing, only used for display.
    * @param key The unique cipher key of the sharing.
    * @param forceDownload True to force download, otherwise content will be opened directly in the browser.
    */
  @silent
  def downloadRoot(reference: String, name: String, key: String, forceDownload: Option[Boolean]): Action[AnyContent] =
    download("/", reference, key, forceDownload)

  /**
    * Downloads a shared file for an unauthenticated user.
    * @param path The paths within the sharing, '/' for the root element.
    * @param reference The reference of the sharing.
    * @param key The unique cipher key of the sharing.
    */
  def download(path: Path, reference: String, key: String, forceDownload: Option[Boolean]): Action[AnyContent] = Action.async { implicit request =>
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
