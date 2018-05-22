package io.cumulus.core.controllers.utils.authentication

import io.cumulus.core.Logging
import io.cumulus.core.controllers.utils.api.ApiErrors
import io.cumulus.core.controllers.utils.authentication.Authentication._
import io.cumulus.core.validation.AppError
import pdi.jwt.JwtSession
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
  * Provides helpers similar in use to the Play's Action, along with helpers to create custom error handlers :
  *
  * {{{
  *
  * def test1 = AuthenticatedAction { _: AuthenticatedRequest[AnyContent] =>
  *   Ok("test1")
  * }
  *
  * def test2 = AuthenticatedAction.withErrorHandler { _: AuthenticatedRequest[AnyContent] =>
  *   Ok("test2")
  * } { _: Request[AnyContent] =>
  *   Future.successful(Unauthorized("test2"))
  * }
  *
  * def test3 = AuthenticatedAction.async { _: AuthenticatedRequest[AnyContent] =>
  *   Future.successful(Ok("test1"))
  * }
  *
  * def test4 = AuthenticatedAction(parseJson[CaseDraftPayload]) { _: AuthenticatedRequest[CaseDraftPayload] =>
  *   Ok("test1")
  * }
  *
  * def test6 = AuthenticatedAction.asyncWithErrorHandler(parseJson[CaseDraftPayload]) {
  *   _: AuthenticatedRequest[CaseDraftPayload] =>
  *     Future.successful(Ok("test1"))
  * } { _: Request[CaseDraftPayload] =>
  *   Future.successful(Unauthorized("test2"))
  * }
  *
  * }}}
  *
  * The action can also be returned to be composed with others action builders with the helper `action`.
  *
  * @tparam TOKEN The session type read from and written to the JWT token. An implicit `Read[SESSION]` and
  *               `Writes[SESSION]` must be in the scope of the controller.
  * @tparam SESSION The enriched session type read from the local server. The way to retrieve this session
  *                 using the `SESSION` session is up to the implementation.
  */
trait Authentication[TOKEN, SESSION] extends BaseController with I18nSupport with Logging {

  case class AuthenticatedRequest[A](authenticatedSession: SESSION, request: Request[A]) extends WrappedRequest[A](request)

  // Type shortcuts
  type ErrorHandler                = Request[_] => Future[Result]
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

  /**
    * Facade object to be used like an action, with methods `apply` and `async` along with methods allowing to provide
    * user defined error handlers.
    */
  protected object AuthenticatedAction {

    /**
      * Default error handler returning a `ApiErrors.unauthorized("api-error.forbidden").toResult`.
      */
    def defaultErrorHandler: ErrorHandler = { implicit request: Request[_] =>
      Future.successful(ApiErrors.unauthorized("api-error.forbidden").toResult)
    }

    def apply(
      block: AuthenticatedAction[AnyContent]
    ): Action[AnyContent] =
      withErrorHandler(parse.default)(block)(defaultErrorHandler)

    def withoutSession(
      block: AuthenticatedAction[AnyContent]
    ): Action[AnyContent] =
      withErrorHandler(parse.default)(block)(defaultErrorHandler, refreshToken = false)

    def apply[A](
      parser: BodyParser[A]
    )(block: AuthenticatedAction[A]): Action[A] =
      withErrorHandler(parser)(block)(defaultErrorHandler)

    def withErrorHandler[A](parser: BodyParser[A])(
      block: AuthenticatedAction[A]
    )(errorHandler: ErrorHandler, refreshToken: Boolean = true): Action[A] =
      asyncWithErrorHandler(parser)(block andThen Future.successful)(errorHandler, refreshToken)

    def async(
      block: AuthenticatedAsyncAction[AnyContent]
    ): Action[AnyContent] =
      asyncWithErrorHandler(parse.default)(block)(defaultErrorHandler)

    def asyncWithoutSession(
      block: AuthenticatedAsyncAction[AnyContent]
    ): Action[AnyContent] =
      asyncWithErrorHandler(parse.default)(block)(defaultErrorHandler, refreshToken = false)

    def asyncWithErrorHandler(
      block: AuthenticatedAsyncAction[AnyContent]
    )(errorHandler: ErrorHandler): Action[AnyContent] =
      asyncWithErrorHandler(parse.default)(block)(errorHandler)

    def async[A](
      bodyParser: BodyParser[A]
    )(block: AuthenticatedAsyncAction[A]): Action[A] =
      asyncWithErrorHandler(bodyParser)(block)(defaultErrorHandler)

    def asyncWithErrorHandler[A](bodyParser: BodyParser[A])(
      block: AuthenticatedAsyncAction[A]
    )(errorHandler: ErrorHandler, refreshToken: Boolean = true): Action[A] =
      action[A](bodyParser)(errorHandler, refreshToken).async(block)

    /**
      * Return an action, to be composed with others action builders.
      */
    def action[B](
      bodyParser: BodyParser[B]
    )(
      errorHandler: ErrorHandler = defaultErrorHandler,
      refreshToken: Boolean = true
    ): ActionBuilder[AuthenticatedRequest, B] =
      new ActionBuilder[AuthenticatedRequest, B] {
        override def parser: BodyParser[B] = bodyParser

        override def invokeBlock[A](
          request: Request[A],
          block: AuthenticatedRequest[A] => Future[Result]
        ): Future[Result] = {
          val headerAuth = request.headers.get(headerName)
          val cookieAuth = request.cookies.get(cookieName).map(_.value)

          val token      = headerAuth.orElse(cookieAuth).getOrElse("")
          val jwtSession = JwtSession.deserialize(token)

          jwtSession.getAs[TOKEN](tokenField) match {
            case Some(user) =>
              retrieveAuthentication(request, user).flatMap {
                case Right(auth) =>
                  block(AuthenticatedRequest(auth, request)).map { req =>
                    if(refreshToken)
                      req.withAuthentication(jwtSession)
                    else
                      req.withoutAuthentication
                  }
                case Left(error) =>
                  logger.warn(s"Authentication failed with a valid token: $error")
                  errorHandler(request)
              }
            case _ =>
              errorHandler(request)
          }
        }

        override protected def executionContext: ExecutionContext = ec
      }

  }

  /**
    * Implicit converter from authenticated request to SESSION.
    */
  implicit def authenticatedRequestToAuthentication[A](implicit r: AuthenticatedRequest[A]): SESSION =
    r.authenticatedSession

  /**
    * Implicit converter from authenticated request to anything able to be implicitly be converted from SESSION.
    */
  implicit def authenticatedRequestTo[A, B](implicit r: AuthenticatedRequest[A], converter: SESSION => B): B =
    converter(r.authenticatedSession)

  /**
    * Create the JWT token for the session.
    *
    * @param authentication The payload of the token.
    */
  protected def createJwtSession(authentication: SESSION): JwtSession =
    JwtSession() + (tokenField, generateSession(authentication))

}

object Authentication {

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
      result.withCookies(Cookie(Authentication.cookieName, jwtSession.refresh().serialize))

    /**
      * Remove the cookie containing the aforementioned session.
      */
    def withoutAuthentication: Result =
      result.discardingCookies(DiscardingCookie(Authentication.cookieName))

  }
}
