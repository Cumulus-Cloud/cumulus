package io.cumulus.controllers

import java.util.UUID

import cats.data.EitherT
import cats.implicits._

import scala.concurrent.{ExecutionContext, Future}
import io.cumulus.controllers.payloads.{SetFirstPasswordPayload, LoginPayload, SignUpPayload}
import io.cumulus.controllers.utils.UserAuthentication
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication._
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.session.UserSession
import io.cumulus.services.{SessionService, UserService}
import io.cumulus.views.CumulusEmailValidationPage
import play.api.libs.json.Json
import play.api.mvc._

class UserController (
  cc: ControllerComponents,
  userService: UserService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  settings: Settings
) extends AbstractController(cc) with UserAuthentication with ApiUtils with BodyParserJson {

  /**
    * The sign up action, to create a new account.
    */
  def signUp: Action[SignUpPayload] =
    Action.async(parseJson[SignUpPayload]) { implicit request =>
      ApiResponse {
        val signInPayload = request.body

        request2Messages

        userService.createUser(
          signInPayload.email,
          signInPayload.login,
          signInPayload.password
        )
      }
    }

  /**
    * Sets the first password if the user needs one.
    */
  def setFirstPassword: Action[SetFirstPasswordPayload] =
    Action.async(parseJson[SetFirstPasswordPayload]) { implicit request =>
      ApiResponse {
        val passwordPayload = request.body

        userService.setFirstPassword(
          passwordPayload.login,
          passwordPayload.password,
          passwordPayload.validationCode
        )
      }
    }

  /**
    * Validates the email of the user. This a static page and not an API endpoint.
    * @param userLogin The login of the user.
    * @param validationCode The secret code sent by mail.
    */
  def validateEmail(userLogin: String, validationCode: String): Action[AnyContent] =
    Action.async { implicit request =>
      userService
        .validateUserEmail(userLogin, validationCode)
        .map { result =>
          Ok(CumulusEmailValidationPage(result))
        }
    }

  /**
    * Resend the validation email to the user. Only works with user-created account waiting for an email validation.
    */
  def resendValidationEmail: Action[LoginPayload] =
    Action.async(parseJson[LoginPayload]) { implicit request =>
      val loginPayload = request.body

      ApiResponse {
        userService.resendEmail(loginPayload.login, loginPayload.password)
      }
    }

  /**
    * Logs in the user using the provided login (account name) and password. After the password and login validation, a
    * new session will be created and stored. A token, containing the password (needed to decipher) and the session
    * unique ID will be returned and placed in the cookies of the response.
    */
  def login: Action[LoginPayload] =
    Action.async(parseJson[LoginPayload]) { implicit request =>
      val loginPayload = request.body

      val maybeSession =
        for {
          user               <- EitherT(userService.checkLoginUser(loginPayload.login, loginPayload.password))
          sessionInformation <- EitherT(sessionService.createSession(request.remoteAddress, user))
          session            =  UserSession(user, sessionInformation, loginPayload.password)
        } yield session

      maybeSession
      .map { session =>
        val token = createJwtSession(session)
        Ok(Json.obj(
          "token" -> token.refresh().serialize,
          "user" -> Json.toJson(session.user)
        )).withAuthentication(token)
      }
      .leftMap(toApiError)
      .merge
    }

  /**
    * Returns information about the user performing the operation.
    */
  def me: Action[AnyContent] =
    AuthenticatedAction { implicit request =>
      ApiResponse {
        Right(request.authenticatedSession.user)
      }
    }

  // TODO: route to change email
  // TODO: route to change password
  // TODO: route to change language

  /**
    * Lists the sessions of the current user.
    *
    * @param limit The maximum number of sessions to return. Used for pagination.
    * @param offset The offset of sessions to return. Used for pagination.
    */
  def listSessions(limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        // TODO allow filter to only active session, with a custom duration
        val pagination = QueryPagination(limit, offset)

        sessionService.listSessions(pagination)
      }
    }

  /**
    * Shows the specified sessions.
    */
  def getSession(sessionId: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        sessionService.findSession(sessionId)
      }
    }

  /**
    * Revokes the specified session.
    *
    * @param sessionId The session to revoke.
    */
  def revokeSession(sessionId: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        if(request.authenticatedSession.information.id == sessionId)
          Future.successful(Left(AppError.validation("validation.user.session-cant-revoke-self")))
        else
          sessionService.revokeSession(sessionId)
      }
    }

  /**
    * Logs out the user performing the operation, clearing the cookies and invalidating the session.
    */
  def logout: Action[AnyContent] =
    AuthenticatedAction.asyncWithoutSession { implicit request =>
      sessionService
        .revokeSession(request.authenticatedSession.information.id)
        .map { _ =>
          Redirect(routes.HomeController.index())
        }
    }

}
