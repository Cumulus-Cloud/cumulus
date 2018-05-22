package io.cumulus.controllers.utils

import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.services.SessionService
import play.api.libs.json.Format
import play.api.mvc.Request

import scala.concurrent.Future

/**
  * Authentication for Cumulus controllers, using the `SessionService` to load users.
  */
trait UserAuthentication extends Authentication[AuthenticationToken, UserSession] {

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

}
