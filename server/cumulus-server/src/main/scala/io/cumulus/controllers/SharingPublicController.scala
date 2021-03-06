package io.cumulus.controllers

import cats.data.EitherT
import cats.implicits._
import com.github.ghik.silencer.silent
import io.cumulus.Settings
import io.cumulus.utils.Base16
import io.cumulus.validation.AppError
import io.cumulus.models.fs.Path
import io.cumulus.models.user.session.SharingSession
import io.cumulus.services.{SessionService, SharingService, StorageService}
import play.api.mvc.{Action, AnyContent, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}


/**
  * Sharing visitor controller. This controller handle all the unauthenticated operation on shared elements.
  */
class SharingPublicController(
  cc: ControllerComponents,
  sharingService: SharingService,
  storageService: StorageService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  val settings: Settings
) extends Api(cc) with DownloadSupport with StreamSupport {

  /**
    * Gets a sharing for an unauthenticated user.
    * @param path The paths within the sharing, '/' for the root element.
    * @param reference The reference of the sharing.
    * @param key The unique cipher key of the sharing.
    */
  def get(path: Path, reference: String, key: String): Action[AnyContent] =
    Action.async { implicit request =>
      sharingService
        .findSharedNode(reference, path, key)
        .map(_.map {
          case (_, _, node) =>
            node
        })
        .toResult
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
  def download(path: Path, reference: String, key: String, forceDownload: Option[Boolean]): Action[AnyContent] =
    Action.async { implicit request =>
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
