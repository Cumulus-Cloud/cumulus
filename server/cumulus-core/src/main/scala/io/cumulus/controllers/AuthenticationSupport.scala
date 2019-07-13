package io.cumulus.controllers

import java.time.Clock

import io.cumulus.validation.AppError
import io.cumulus.{Logging, Settings}
import io.cumulus.controllers.AuthenticationSupport._
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.i18n.I18nSupport
import play.api.libs.json.Format
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}


/**
  * Authentication trait using JWT. Needs to be extends by a controller which wants to use authentication.<br/><br/>
  *
  * The session uses two elements. An authentication token, that only needs to be serializable to JSON, and the session
  * itself that is constructed by the user by implementing the related method.<br/><br/>
  *
  * The session can either be specified using an "auth" cookie (set after the login), or by providing the token given
  * after the login in an "Authorization" header.<br/><br/>
  *
  * @tparam TOKEN The session type read from and written to the JWT token. An implicit `Read[SESSION]` and
  *               `Writes[SESSION]` must be in the scope of the controller.
  * @tparam SESSION The enriched session type read from the local server. The way to retrieve this session
  *                 using the `SESSION` session is up to the implementation.
  */
trait AuthenticationSupport[TOKEN, SESSION] extends BaseController with I18nSupport with ErrorSupport with Logging {

  implicit def settings: Settings

  // Implicit used by jwt sessions
  implicit val clock: Clock = Clock.systemUTC
  implicit val conf: Configuration = settings.underlying

  case class AuthenticatedRequest[A](authenticatedSession: SESSION, request: Request[A]) extends WrappedRequest[A](request)

  // Type shortcuts
  type ErrorHandler                = Request[_] => Result
  type ErrorHandlerAsync           = Request[_] => Future[Result]
  type AuthenticatedAction[A]      = AuthenticatedRequest[A] => Result
  type AuthenticatedAsyncAction[A] = AuthenticatedRequest[A] => Future[Result]

  /** The execution context of the requests. */
  implicit def ec: ExecutionContext

  /** Format of the session. */
  implicit def format: Format[TOKEN]

  /** Retrieve authentication from the sessions */
  def retrieveAuthentication(request: Request[_], user: TOKEN): Future[Either[AppError, SESSION]]

  /** Generate a session from the authentication. */
  def generateSession(auth: SESSION): TOKEN

  /** Default error handler when no valid authentication is found. */
  def defaultErrorHandler: ErrorHandlerAsync = { implicit request: Request[_] =>
    Future.successful(AppError.unauthorized.toResult)
  }

  val AuthenticatedAction: ActionBuilder[AuthenticatedRequest, AnyContent] =
    Action andThen WithAuthentication()

  def AuthenticatedActionWith(discardToken: Boolean = false, refreshToken: Boolean = true, errorHandler: ErrorHandlerAsync = defaultErrorHandler): ActionBuilder[AuthenticatedRequest, AnyContent] =
    Action andThen WithAuthentication(discardToken = discardToken, refreshToken = refreshToken, errorHandler = errorHandler)

  /** Custom action transformer. */
  def WithAuthentication(discardToken: Boolean = false, refreshToken: Boolean = true, errorHandler: ErrorHandlerAsync = defaultErrorHandler): ActionFunction[Request, AuthenticatedRequest] =
    new ActionFunction[Request, AuthenticatedRequest] {

      final def invokeBlock[A](request: Request[A], block: AuthenticatedRequest[A] => Future[Result]): Future[Result] = {
        val headerAuth = request.headers.get(headerName)
        val cookieAuth = request.cookies.get(cookieName).map(_.value)

        val token      = headerAuth.orElse(cookieAuth).getOrElse("")
        val jwtSession = JwtSession.deserialize(token)

        jwtSession.getAs[TOKEN](tokenField) match {
          case Some(user) =>
            retrieveAuthentication(request, user).flatMap {
              case Right(auth) =>
                block(AuthenticatedRequest(auth, request)).map { req =>
                  if(discardToken)
                    req.withoutAuthentication
                  else if(refreshToken)
                    req.withAuthentication(jwtSession.refresh)
                  else
                    req
                }
              case Left(error) =>
                logger.warn(s"Authentication failed with a valid token: $error")
                errorHandler(request)
            }
          case _ =>
            errorHandler(request)
        }
      }

      override protected def executionContext: ExecutionContext =
        ec

    }

  /**
    * Implicit converter from authenticated request to SESSION.
    */
  implicit def authenticatedRequestToAuthentication(implicit request: AuthenticatedRequest[_]): SESSION =
    request.authenticatedSession

  /**
    * Create the JWT token for the session.
    *
    * @param authentication The payload of the token.
    */
  protected def createJwtSession(authentication: SESSION): JwtSession =
    JwtSession() + (tokenField, generateSession(authentication))

}

object AuthenticationSupport {

  val tokenField = "content"

  val headerName = "Authorization"
  val cookieName = "auth"

  implicit class AuthResult(val result: Result) extends AnyVal {

    /**
      * Add (and refresh) a cookie containing the serialize session to a result.
      *
      * @param jwtSession The JWT session to serialize.
      */
    def withAuthentication(jwtSession: JwtSession): Result =
      result.withCookies(Cookie(AuthenticationSupport.cookieName, jwtSession.refresh().serialize))

    /**
      * Remove the cookie containing the aforementioned session.
      */
    def withoutAuthentication: Result =
      result.discardingCookies(DiscardingCookie(AuthenticationSupport.cookieName))

  }
}
