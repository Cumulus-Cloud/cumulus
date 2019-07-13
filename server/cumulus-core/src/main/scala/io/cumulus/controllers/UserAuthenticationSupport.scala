package io.cumulus.controllers

import io.cumulus.models.user.User
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.services.SessionService
import io.cumulus.validation.AppError
import play.api.i18n.{I18nSupport, Lang, Messages}
import play.api.libs.json.Format
import play.api.mvc.{ActionFilter, Request, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

/**
  * Authentication for Cumulus controllers, using the `SessionService` to load users.
  */
trait UserAuthenticationSupport extends AuthenticationSupport[AuthenticationToken, UserSession] with I18nSupport { self =>

  def sessionService: SessionService

  /** Format of the session. */
  implicit val format: Format[AuthenticationToken] =
    AuthenticationToken.format

  /** Retrieve authentication from the sessions */
  def retrieveAuthentication(
    request: Request[_],
    token: AuthenticationToken
  ): Future[Either[AppError, UserSession]] =
    sessionService.findValidSession(request.remoteAddress, token)

  /** Generate a session from the authentication. */
  def generateSession(session: UserSession): AuthenticationToken =
    AuthenticationToken.create(session)

  /** Override i18n to find the preferred language by the user's specification rather than the request locale. */
  override implicit def request2Messages(implicit request: RequestHeader): Messages =
    request match {
      case authenticatedRequest: AuthenticatedRequest[_] =>
        messagesApi.preferred(Seq(Lang(authenticatedRequest.authenticatedSession.lang)))
      case otherRequest =>
        // Fallback if not an authenticated request
        super.request2Messages(otherRequest)
    }

  /** Filter for admin-only actions. */
  val WithAdmin: ActionFilter[AuthenticatedRequest] =
    new ActionFilter[AuthenticatedRequest] {

      override protected def filter[A](request: AuthenticatedRequest[A]): Future[Option[Result]] = Future.successful {
        if (!request.authenticatedSession.user.isAdmin)
          Some(AppError.unauthorized.toResult(request))
        else
          None
      }

      override protected def executionContext: ExecutionContext =
        ec

    }

  /**
    * Implicit converter from an authenticated request to user.
    */
  implicit def authenticatedRequestToUser(implicit request: AuthenticatedRequest[_]): User =
    request.authenticatedSession.user

}
