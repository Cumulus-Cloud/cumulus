package io.cumulus.controllers

import io.cumulus.validation.AppError
import play.api.Environment
import play.api.http.{HttpErrorHandler, MimeTypes, PreferredMediaTypeHttpErrorHandler}
import play.api.i18n.MessagesApi
import play.api.mvc.{RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}


object ErrorHandler {

  def apply(env: Environment, messagesApi: MessagesApi)(implicit ec: ExecutionContext): HttpErrorHandler = {
    PreferredMediaTypeHttpErrorHandler(
      MimeTypes.JSON -> new JsonErrorHandler(env, messagesApi), // Also the default error handler when no mime-type is requested
      MimeTypes.HTML -> new TextErrorHandler(env, messagesApi), // TODO return an actual HTML page
      MimeTypes.TEXT -> new TextErrorHandler(env, messagesApi)
    )
  }

}

/** Common error handling, requiring an error support to known how to write errors. */
trait BaseErrorHandler extends HttpErrorHandler with ErrorSupport {

  def env: Environment
  implicit def ec: ExecutionContext

  override def onClientError(request: RequestHeader, statusCode: Int, message: String): Future[Result] =
    Future.successful(AppError.validation("api-error.clienterror", message).toResult(request))

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] =
    Future.successful(AppError.technical(exception).toResult(request))

}

/** Text error handler. */
class TextErrorHandler(
  val env: Environment,
  val messagesApi: MessagesApi
)(
  implicit val ec: ExecutionContext
) extends BaseErrorHandler with TextSerializationSupport

/** JSON error handler. */
class JsonErrorHandler(
  val env: Environment,
  val messagesApi: MessagesApi
)(
  implicit val ec: ExecutionContext
) extends BaseErrorHandler with JsonSerializationSupport

