package io.cumulus

import akka.http.scaladsl.model.RemoteAddress
import akka.http.scaladsl.model.headers.HttpCookie
import akka.http.scaladsl.server.Directives.{deleteCookie, extractClientIP, reject, setCookie}
import akka.http.scaladsl.server.{Directive, Directive0, Directive1, RequestContext}
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.services.SessionService
import io.cumulus.validation.AppError
import io.cumulus.AppErrorRejection._

import scala.concurrent.{ExecutionContext, Future}


trait Authenticator[TOKEN, SESSION] {

  val tokenService: TokenService[TOKEN]

  def encodeToken(token: TOKEN): String =
    tokenService.encode(token)

  def decodeToken(token: String): Either[AppError, TOKEN] =
    tokenService.decode(token)

  /** Defines how the session is retrieved. */
  def retrieveSession(address: RemoteAddress, token: TOKEN): Future[Either[AppError, SESSION]]

  /** Defines how the token is created from a session. */
  def tokenFromSession(session: SESSION): TOKEN

}

class UserAuthenticator(
  sessionService: SessionService,
  val tokenService: TokenService[AuthenticationToken]
) extends Authenticator[AuthenticationToken, UserSession] {

  override def tokenFromSession(session: UserSession): AuthenticationToken =
    AuthenticationToken.create(session)

  override def retrieveSession(address: RemoteAddress, token: AuthenticationToken): Future[Either[AppError, UserSession]] =
    sessionService.findValidSession(
      address.toOption.map(_.getHostAddress).getOrElse("0.0.0.0"),
      token
    )

}

/**
 * Base trait defining a service capable of authenticating an incoming request.
 * @tparam TOKEN The token's claim type.
 * @tparam SESSION The session type.
 */
trait AuthenticationSupport[TOKEN, SESSION] {

  val headerName = "Authorization"
  val cookieName = "auth"

  def auth: Authenticator[TOKEN, SESSION]

  implicit def ec: ExecutionContext

  def setAuthentication(session: SESSION): Directive0 =
    setCookie(HttpCookie(cookieName, value = auth.encodeToken(auth.tokenFromSession(session))))

  def removeAuthentication: Directive0 =
    deleteCookie(cookieName)

  /**
   * Directive to provide an authentication. When a request failed, it will be rejected with a AppErrorRejection
   * rejection, containing the AppError describing why the request was rejected.
   */
  val extractAuthentication: Directive1[SESSION] =
    extractClientIP.flatMap { ipAddress =>
      Directive { inner => ctx =>
        extractToken(ctx).flatMap(auth.decodeToken(_)) match {
          // Token successfully parsed & validated
          case Right(token) =>
            auth.retrieveSession(ipAddress, token).flatMap {
              // Authentication ok
              case Right(user) =>
                inner(Tuple1(user))(ctx)
              // Authentication failed (session terminated, etc..)
              case Left(appError) =>
                reject(appError)(ctx)
            }
          // Token could not be parsed or validated
          case Left(appError) =>
            reject(appError)(ctx)
        }
      }
    }


  /** Safely try to extract the token from the provided request. */
  private def extractToken(ctx: RequestContext): Either[AppError, String] = {
    val request = ctx.request

    val headerAuth = request.headers.find(_.is(headerName)).map(_.value)
    val cookieAuth = request.cookies.find(_.name == cookieName).map(_.value)

    headerAuth
      .orElse(cookieAuth)
      .toRight(AppError.unauthorized("auth.error.not-found"))
  }

}

