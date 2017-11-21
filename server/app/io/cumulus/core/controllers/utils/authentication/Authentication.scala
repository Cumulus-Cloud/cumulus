package io.cumulus.core.controllers.utils.authentication


import scala.concurrent.{ExecutionContext, Future}
import scala.language.implicitConversions

import io.cumulus.core.controllers.utils.api.ApiErrors
import pdi.jwt.JwtSession
import play.api.i18n.I18nSupport
import play.api.libs.json.{Format, Writes}
import play.api.mvc._

/**
  * Authentication trait using JWT. Needs to be extends by a controller which wants to use authentication.
  *
  * Provides helpers similar in use to the Play's Action, along with helpers to create custom
  * error handlers :
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
  *   Future.successful(Forbidden("test2"))
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
  *   Future.successful(Forbidden("test2"))
  * }
  *
  * }}}
  *
  * The action can also be returned to be composed with others action builders with the helper `action`
  *
  * @tparam USER The authentication type read from and written to the JWT token. An implicit `Read[USER]` and
  *              `Writes[USER]` must be in the scope of the controller.
  */
trait Authentication[USER] extends BaseController with I18nSupport {

  import Authentication._

  case class AuthenticatedRequest[A](user: USER, request: Request[A]) extends WrappedRequest[A](request)

  // Type shortcuts
  type ErrorHandler                = Request[_] => Future[Result]
  type AuthenticatedAction[A]      = AuthenticatedRequest[A] => Result
  type AuthenticatedAsyncAction[A] = AuthenticatedRequest[A] => Future[Result]

  /**
    * Facade object to be used like an action, with methods `apply` and `async` along with methods allowing to provide
    * user defined error handlers.
    */
  protected object AuthenticatedAction {

    /**
      * Default error handler returning a `ApiErrors.forbidden("api-error.forbidden").toResult`
      */
    def defaultErrorHandler: ErrorHandler = { implicit request: Request[_] =>
      Future.successful(ApiErrors.forbidden("api-error.forbidden").toResult)
    }

    def apply(
      block: AuthenticatedAction[AnyContent]
    )(implicit ec: ExecutionContext, format: Format[USER]): Action[AnyContent] =
      async(block andThen Future.successful)

    def withErrorHandler(
      block: AuthenticatedAction[AnyContent]
    )(errorHandler: ErrorHandler)(implicit ec: ExecutionContext, format: Format[USER]): Action[AnyContent] =
      asyncWithErrorHandler(block andThen Future.successful)(errorHandler)

    def apply[A](
      parser: BodyParser[A]
    )(block: AuthenticatedAction[A])(implicit ec: ExecutionContext, format: Format[USER]): Action[A] =
      async(parser)(block andThen Future.successful)

    def withErrorHandler[A](parser: BodyParser[A])(
      block: AuthenticatedAction[A]
    )(errorHandler: ErrorHandler)(implicit ec: ExecutionContext, format: Format[USER]): Action[A] =
      asyncWithErrorHandler(parser)(block andThen Future.successful)(errorHandler)

    def async(
      block: AuthenticatedAsyncAction[AnyContent]
    )(implicit ec: ExecutionContext, format: Format[USER]): Action[AnyContent] =
      asyncWithErrorHandler(parse.default)(block)(defaultErrorHandler)

    def asyncWithErrorHandler(
      block: AuthenticatedAsyncAction[AnyContent]
    )(errorHandler: ErrorHandler)(implicit ec: ExecutionContext, format: Format[USER]): Action[AnyContent] =
      asyncWithErrorHandler(parse.default)(block)(errorHandler)

    def async[A](
      bodyParser: BodyParser[A]
    )(block: AuthenticatedAsyncAction[A])(implicit ec: ExecutionContext, format: Format[USER]): Action[A] =
      asyncWithErrorHandler(bodyParser)(block)(defaultErrorHandler)

    def asyncWithErrorHandler[A](bodyParser: BodyParser[A])(
      block: AuthenticatedAsyncAction[A]
    )(errorHandler: ErrorHandler)(implicit ec: ExecutionContext, format: Format[USER]): Action[A] =
      action[A](bodyParser)(errorHandler).async(block)

    /**
      * Return an action, to be composed with others action builders
      */
    def action[B](
      bodyParser: BodyParser[B]
    )(errorHandler: ErrorHandler = defaultErrorHandler)(implicit ec: ExecutionContext, format: Format[USER]) =
      new ActionBuilder[AuthenticatedRequest, B] {
        override def parser = bodyParser

        override def invokeBlock[A](request: Request[A], block: (AuthenticatedRequest[A]) => Future[Result]) = {
          val jwtSession =
            JwtSession.deserialize(request.cookies.get(COOKIE_NAME).getOrElse(Cookie(COOKIE_NAME, "")).value)

          jwtSession.getAs[USER](TOKEN_FIELD).map(AuthenticatedRequest(_, request)) match {
            case Some(authenticatedRequest) => block(authenticatedRequest).map(_.withAuthentication(jwtSession))
            case None                       => errorHandler(request)
          }
        }

        override protected def executionContext = ec
      }

  }

  /**
    * Implicit converter from authenticated request to USER
    */
  implicit def authenticatedRequestToUser[A](implicit r: AuthenticatedRequest[A]): USER =
    r.user

  /**
    * Implicit converter from authenticated request to anything able to be implicitly be converted from USER
    */
  implicit def authenticatedRequestTo[A, B](implicit r: AuthenticatedRequest[A], converter: USER => B): B =
    converter(r.user)

  /**
    * Create the JWT token for the session
    *
    * @param payload The payload of the token
    */
  protected def createJwtSession(payload: USER)(implicit writes: Writes[USER]): JwtSession =
    JwtSession() + (TOKEN_FIELD, payload)

}

object Authentication {

  val TOKEN_FIELD = "content"
  val COOKIE_NAME = "auth"

  implicit class AuthResult(val result: Result) extends AnyVal {

    /**
      * Add (and refresh) a cookie containing the serialize session to a result
      * @param jwtSession The JWT session to serialize
      */
    def withAuthentication(jwtSession: JwtSession): Result =
      result.withCookies(Cookie(Authentication.COOKIE_NAME, jwtSession.refresh().serialize))

    /**
      * Remove the cookie containing the aforementioned session
      */
    def withoutAuthentication: Result =
      result.discardingCookies(DiscardingCookie(Authentication.COOKIE_NAME))

  }
}
