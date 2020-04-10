package io.cumulus.controllers.utils

import java.net.InetAddress

import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives.{as, complete, entity, extractRequest, onComplete, reject, _}
import akka.http.scaladsl.server.PathMatcher.Matched
import akka.http.scaladsl.server._
import akka.http.scaladsl.unmarshalling.{FromRequestUnmarshaller, Unmarshaller}
import akka.stream.scaladsl.Source
import akka.util.ByteString
import cats.data.EitherT
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport
import io.cumulus.Settings
import io.cumulus.i18n.{Lang, LangMessages, Messages}
import io.cumulus.models.fs.{File, Path}
import io.cumulus.models.user.User
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.controllers.utils.AppErrorRejection._
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.utils.Range
import io.cumulus.validation.AppError
import io.cumulus.views.View
import play.api.libs.json.Writes

import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps
import scala.util.control.NonFatal
import scala.util.{Failure, Success}


/** Provides a directive to extract the context (or authenticated context) of a query. */
trait ContextExtractionSupport
  extends AuthenticationSupport[AuthenticationToken, UserSession]
    with LangSupport {

  implicit val m: Messages
  implicit val ec: ExecutionContext
  implicit val settings: Settings

  trait Context {
    def request: HttpRequest
    def lang: Lang
    def ip: InetAddress
  }

  case class UnauthenticatedContext(
    request: HttpRequest,
    lang: Lang,
    ip: InetAddress
  ) extends Context

  case class AuthenticatedContext(
    request: HttpRequest,
    lang: Lang,
    ip: InetAddress,
    session: UserSession
  ) extends Context {

    def user: User =
      session.user

  }

  implicit def contextToLang(implicit ctx: Context): Lang =
    ctx.lang

  implicit def contextToMassageLang(implicit messages: Messages, ctx: Context): LangMessages =
    messages.messagesForLang(ctx.lang)

  implicit def authenticatedContextToSession(implicit ctx: AuthenticatedContext): UserSession =
    ctx.session

  implicit def authenticatedContextToUser(implicit ctx: AuthenticatedContext): User =
    ctx.user

  def withContext: Directive1[UnauthenticatedContext] =
    (extractRequest & extractClientIP & extractLang).tmap {
      case (request, ip, lang) =>
        val ipAddress = ip.toOption.getOrElse(InetAddress.getByName("0.0.0.0"))
        UnauthenticatedContext(request, lang, ipAddress)
    }

  def withAuthentication: Directive1[AuthenticatedContext] =
    (extractRequest & extractClientIP & extractLang & extractAuthentication).tmap {
      case (request, ip, lang, session) =>
        val ipAddress = ip.toOption.getOrElse(InetAddress.getByName("0.0.0.0"))
        AuthenticatedContext(request, lang, ipAddress, session)
    }

  /** Helper to extract a fs path from a matching path. */
  object CumulusPath extends PathMatcher1[Path] {
    def apply(path: akka.http.scaladsl.model.Uri.Path): Matched[Tuple1[Path]] =
      Matched(akka.http.scaladsl.model.Uri.Path.Empty, Tuple1(Path.sanitize("/" + path.toString)))
  }

}

trait JsonResponseWriterSupport extends ResponseWriterSupport with PlayJsonSupport {

  implicit def JsonResulting[T](implicit writes: Writes[T]): Resulting[T] = new Resulting[T] {
    def completeWith(value: T, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route =
      complete(forcedStatus.getOrElse(StatusCodes.OK), value) // Default Play-Json marshaller
  }

  implicit val UnitResulting: Resulting[Unit] = new Resulting[Unit] {
    def completeWith(value: Unit, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route =
      complete(forcedStatus.getOrElse(StatusCodes.NoContent): StatusCode)
  }

  implicit val AppErrorResulting: Resulting[AppError] = new Resulting[AppError] {
    def completeWith(appError: AppError, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route =
      complete(
        forcedStatus.getOrElse(StatusCodes.getForKey(appError.errorType.status).getOrElse(StatusCodes.BadRequest)),
        AppError.writes(m).writes(appError)
      )
  }

}

trait HtmlResponseWriterSupport extends ResponseWriterSupport {

  implicit def ViewResulting[T <: View]: Resulting[T] = new Resulting[T] {
    def completeWith(value: T, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route =
      complete(
        forcedStatus.getOrElse(StatusCodes.OK),
        HttpEntity(ContentTypes.`text/html(UTF-8)`, value.render(l))
      )
  }

  implicit val AppErrorResulting: Resulting[AppError] = new Resulting[AppError] {
    def completeWith(appError: AppError, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route =
      complete(
        forcedStatus.getOrElse(StatusCodes.getForKey(appError.errorType.status).getOrElse(StatusCodes.BadRequest)),
        HttpEntity(ContentTypes.`text/html(UTF-8)`, appError.key) // TODO error template + i18n
      )
  }

}

/** Allow to complete a query with an Either[AppError, T] using 'toResult' helper. */
trait ResponseWriterSupport extends LangSupport with PlayJsonSupport {

  implicit val m: Messages
  implicit val ec: ExecutionContext
  implicit val settings: Settings

  trait Resulting[T] {
    def completeWith(value: T, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route
  }

  implicit val RouteResulting: Resulting[Route] = new Resulting[Route] {
    def completeWith(value: Route, forcedStatus: Option[StatusCode] = None)(implicit l: Lang, m: Messages): Route =
      value
  }

  // Must define how to handle errors
  implicit val AppErrorResulting: Resulting[AppError]

  implicit class ToResult[T](result: T)(implicit resulting: Resulting[T]) {

    def toResult(implicit l: Lang, m: Messages): Route =
      resulting.completeWith(result)

    def toResultAs(statusCode: StatusCode)(implicit l: Lang, m: Messages): Route =
      resulting.completeWith(result, Some(statusCode))

  }

  implicit class EitherToResult[T](result: Either[AppError, T])(implicit resulting: Resulting[T]) {

    def toResult(implicit l: Lang, m: Messages): Route =
      result match {
        case Right(value) =>
          resulting.completeWith(value)
        case Left(appError) =>
          AppErrorResulting.completeWith(appError)
      }

    def toResultAs(statusCode: StatusCode)(implicit l: Lang, m: Messages): Route =
      result match {
        case Right(value) =>
          resulting.completeWith(value, Some(statusCode))
        case Left(appError) =>
          AppErrorResulting.completeWith(appError)
      }

  }

  implicit class FutureToResult[T](result: Future[T])(implicit resulting: Resulting[T]) {

    def toResult(implicit l: Lang, m: Messages): Route =
      onComplete(result) {
        case Success(value) =>
          resulting.completeWith(value, None)
        case Failure(exception) =>
          reject(AppError.technical(exception))
      }

    def toResultAs(statusCode: StatusCode)(implicit l: Lang, m: Messages): Route =
      onComplete(result) {
        case Success(value) =>
          resulting.completeWith(value, Some(statusCode))
        case Failure(exception) =>
          reject(AppError.technical(exception))
      }

  }

  implicit class EitherTToResult[T](result: EitherT[Future, AppError, T])(implicit resulting: Resulting[T]) {

    def toResult(implicit l: Lang, m: Messages): Route =
      FutureEitherToResult(result.value).toResult

    def toResultAs(statusCode: StatusCode)(implicit l: Lang, m: Messages): Route =
      FutureEitherToResult(result.value).toResultAs(statusCode)

  }

  implicit class FutureEitherToResult[T](result: Future[Either[AppError, T]])(implicit resulting: Resulting[T]) {

    def toResult(implicit l: Lang, m: Messages): Route =
      onComplete(result.map(EitherToResult(_).toResult)) {
        case Success(value) =>
          value
        case Failure(exception) =>
          reject(AppError.technical(exception))
      }

    def toResultAs(statusCode: StatusCode)(implicit l: Lang, m: Messages): Route =
      onComplete(result.map(EitherToResult(_).toResultAs(statusCode))) {
        case Success(value) =>
          value
        case Failure(exception) =>
          reject(AppError.technical(exception))
      }

  }

}

/** Custom directive for reading payloads. */
trait PayloadParsingSupport {

  def payload[T](implicit um: FromRequestUnmarshaller[T]): Directive1[T] =
    entity(as[T])

}

/** Custom directives for extracting pagination. */
trait PaginationSupport {

  implicit val settings: Settings

  val paginationParams: Directive1[QueryPagination] =
    parameters("limit".as[Int]?, "offset".as[Int]?)
      .tmap(v => QueryPagination(v._1, v._2))

}

/** Custom unmarshallers. */
trait Unmarshallers {

  implicit val pathUnmarshaller: Unmarshaller[String, Path] =
    Unmarshaller.strict[String, Path](s => Path.sanitize(s))

}

trait FileStreamingSupport {

  protected def parseRange(rangeRaw: Option[String], file: File): Either[AppError, Option[Range]] = {
    val range = rangeRaw.map { rangeHeader =>
      rangeHeader.split('=').toList match {
        case "bytes" :: r :: Nil => r.split('-').map(_.toLong).toList match {
          case from :: to :: Nil => Range(from, to)
          case from :: Nil => Range(from, file.size - 1)
          case _ => Range(0, file.size - 1)
        }
        case _ => Range(0, file.size - 1)
      }
    }

    range match {
      case Some(Range(_, to)) if to > (file.size - 1) =>
        AppError.notAcceptable("validation.range.range-outside-end")
      case Some(Range(from, _)) if from < 0 =>
        AppError.notAcceptable("validation.range.range-outside-start")
      case Some(Range(from, to)) if to < from =>
        AppError.notAcceptable("validation.range.range-negative")
      case maybeValidRange =>
        Right(maybeValidRange)
    }
  }

  protected def streamFile(
    file: File,
    content: Source[ByteString, _],
    range: Range
  ): Route =
    streamFile(file.size, file.mimeType, content, range)

  protected def streamFile(
    size: Long,
    mimeType: String,
    content: Source[ByteString, _],
    range: Range
  ): Route = {

    complete(
      StatusCodes.PartialContent,
      List(
        RawHeader("Content-Type", mimeType),
        RawHeader("Content-Transfer-Encoding", "Binary"),
        RawHeader("Content-Range", s"bytes ${range.start}-${range.end}/$size"),
        RawHeader("Accept-Ranges", "bytes")
      ),
      HttpEntity(ContentTypes.`application/octet-stream`, content)
    )

  }

}

trait FileDownloadSupport {

  protected def downloadFile(
    file: File,
    content: Source[ByteString, _],
    forceDownload: Boolean
  ): Route =
    downloadFile(file.name, file.size, file.mimeType, content, forceDownload)

  protected def downloadFile(
    fileName: String,
    size: Long,
    mimeType: String,
    content: Source[ByteString, _],
    forceDownload: Boolean
  ): Route = {

    complete(
      StatusCodes.OK,
      List(
        if(forceDownload)
          RawHeader("Content-Disposition", s"attachment; filename*=UTF-8''$fileName")
        else
          RawHeader("Content-Disposition", "inline"),
        RawHeader("Content-Type", mimeType),
        RawHeader("Content-Length", size.toString),
      ),
      HttpEntity(ContentTypes.`application/octet-stream`, content)
    )

  }

}

trait ErrorSupport extends ContextExtractionSupport with ResponseWriterSupport {

  implicit val m: Messages

  /** Default exception handler. */
  implicit val exceptionHandler: ExceptionHandler =
    ExceptionHandler {
      case NonFatal(e) =>
        withContext { implicit ctx =>
          AppError.technical(e).toResult
        }
    }

}

trait RejectionSupport extends ContextExtractionSupport with ResponseWriterSupport {

  implicit val m: Messages

  /** Default rejection handler. */
  implicit val rejectionHandler: RejectionHandler =
    RejectionHandler
      .newBuilder()
      .handle {
        case AppErrorRejection(appError) =>
          withContext { implicit ctx =>
            appError.toResult
          }
        case MethodRejection(supported) =>
          withContext { implicit ctx =>
            AppError.validation("error.unsupported-method", supported.value).toResultAs(StatusCodes.MethodNotAllowed)
          }
        case RequestEntityExpectedRejection =>
          withContext { implicit ctx =>
            AppError.validation("error.missing-body").toResultAs(StatusCodes.BadRequest)
          }
        // TODO match other rejections causes ?
      }
      .handleNotFound {
        withContext { implicit ctx =>
          AppError.notFound("error.not-found", ctx.request.uri.path.toString).toResult // TODO i18n ?
        }
      }
      .handleAll[MissingQueryParamRejection] { params =>
        withContext { implicit ctx =>
          val missingParams = params.map(_.parameterName).mkString(", ")
          AppError.validation("error.missing-params", missingParams).toResultAs(StatusCodes.MethodNotAllowed)
        }
      }
      .result()

}

trait ControllerComponent extends
  ContextExtractionSupport with
  AuthenticationSupport[AuthenticationToken, UserSession] with
  ResponseWriterSupport with
  PayloadParsingSupport with
  Unmarshallers {

  val routes: Route

}

trait ApiComponent extends
  ControllerComponent with
  JsonResponseWriterSupport with
  FileDownloadSupport with
  FileStreamingSupport with
  PaginationSupport

trait AppComponent extends
  ControllerComponent with
  HtmlResponseWriterSupport

