package io.cumulus.core.controllers.utils.api

import scala.concurrent.Future

import play.api.http.Status._
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.i18n.{I18nSupport, Messages, MessagesApi}

class HttpErrorHandler(implicit val messagesApi: MessagesApi) extends play.api.http.HttpErrorHandler with I18nSupport {

  val logger = play.api.Logger(this.getClass)

  def onClientError(request: RequestHeader, statusCode: Int, message: String = ""): Future[Result] = {
    implicit val messages: Messages = messagesApi.preferred(request)

    statusCode match {
      case BAD_REQUEST => Future.successful(ApiErrors.badRequest(message).toResult)
      case NOT_FOUND   => Future.successful(ApiErrors.routeNotFound(request.method, request.path).toResult)
      case FORBIDDEN   => Future.successful(ApiErrors.forbidden(message).toResult)
      case _ =>
        Future.successful(
          ApiError(status = Results.Status(statusCode), key = "api-error.clienterror", message).toResult
        )
    }
  }

  def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = {
    implicit val messages: Messages = messagesApi.preferred(request)
    logger.error(s"Uncatched error for request: ${request.method} ${request.uri}", exception)
    Future.successful(ApiErrors.internalServerError.toResult)
  }
}
