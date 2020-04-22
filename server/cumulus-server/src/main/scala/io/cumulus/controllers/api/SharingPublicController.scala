package io.cumulus.controllers.api

import akka.http.scaladsl.server.Directive._
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Directive1, Route}
import cats.data.EitherT
import cats.implicits._
import io.cumulus.controllers.utils.{ApiComponent, Authenticator, FileDownloadSupport, FileStreamingSupport}
import io.cumulus.i18n.Messages
import io.cumulus.models.fs.Path
import io.cumulus.models.user.session.{AuthenticationToken, SharingSession, UserSession}
import io.cumulus.services.{SharingService, StorageService}
import io.cumulus.utils.Base16
import io.cumulus.validation.AppError
import io.cumulus.Settings

import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps


/**
  * Sharing visitor controller. This controller handle all the unauthenticated operation on shared elements.
  */
class SharingPublicController(
  storageService: StorageService,
  sharingService: SharingService,
  val auth: Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends ApiComponent with FileDownloadSupport with FileStreamingSupport {

  /**
   * @param reference The reference of the sharing.
   * @param key The unique cipher key of the sharing.
   */
  case class GetByPathParams(reference: String, key: String)

  object GetByPathParams {

    def extract: Directive1[GetByPathParams] =
      parameters("reference", "key")
        .as[GetByPathParams](GetByPathParams.apply _)

  }

  /**
    * Gets a sharing for an unauthenticated user.
    */
  val getByPath: Route =
    (post & path("api" / "shared" / CumulusPath) & GetByPathParams.extract) { (path, params) =>
      withContext { implicit ctx =>
        sharingService
          .findSharedNode(params.reference, path, params.key)
          .map(_.map {
            case (_, _, node) =>
              node
          })
          .toResult
      }
    }

  case class DownloadRootParams(key: String, forceDownload: Option[Boolean], range: Option[String])

  object DownloadRootParams {

    def extract: Directive1[DownloadRootParams] =
      (parameters("key", "forceDownload".as[Boolean] ?) & optionalHeaderValueByName("range"))
        .as[DownloadRootParams](DownloadRootParams.apply _)

  }

  /**
   * Downloads the root element of the sharing.
   */
  val downloadRoot: Route =
    (post & path("shared" / "download" / Segment / Segment) & DownloadRootParams.extract) { (reference, _, params) =>
      withContext { implicit ctx =>
        doDownload(Path(Seq("/")), reference, params.key, params.range, params.forceDownload)
      }
    }

  case class DownloadParams(reference: String, key: String, forceDownload: Option[Boolean], range: Option[String])

  object DownloadParams {

    def extract: Directive1[DownloadParams] =
      (parameters("reference", "key", "forceDownload".as[Boolean] ?) & optionalHeaderValueByName("range"))
        .as[DownloadParams](DownloadParams.apply _)

  }

  /**
   * Downloads the specified element of the sharing.
   */
  val download: Route =
    (post & path("api" / "shared" / "download" / CumulusPath) & DownloadParams.extract) { (path, params) =>
      withContext { implicit ctx =>
        doDownload(path, params.reference, params.key, params.range, params.forceDownload)
      }
    }

  val routes: Route =
    concat(
      getByPath,
      downloadRoot,
      download
    )

  private def doDownload(
    path: Path,
    reference: String,
    key: String,
    range: Option[String],
    forceDownload: Option[Boolean]
  )(implicit
    ctx: UnauthenticatedContext
  ): Route = {
    val response = for {
      // Get the sharing, the user and the file
      res <- EitherT(sharingService.findSharedFile(reference, path, key))
      (sharing, user, file) = res

      // Decode the key & generate a session
      decodedKey <- EitherT.fromEither[Future](Base16.decode(key).toRight(AppError.validation("validation.sharing.invalid-key")))
      session = SharingSession(user, sharing, decodedKey)

      // Get the file's content
      maybeRange <- EitherT.fromEither[Future](parseRange(range, file))
      content <- EitherT.fromEither[Future](storageService.downloadFile(file, maybeRange)(session))

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

    response.toResult
  }

}
