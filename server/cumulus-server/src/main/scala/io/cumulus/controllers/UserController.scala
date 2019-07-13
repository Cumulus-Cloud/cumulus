package io.cumulus.controllers

import java.util.UUID

import cats.data.EitherT
import cats.implicits._
import io.cumulus.Settings
import io.cumulus.controllers.payloads._
import io.cumulus.controllers.AuthenticationSupport._
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.validation.AppError
import io.cumulus.models.user.session.UserSession
import io.cumulus.services.{EventService, SessionService, UserService}
import io.cumulus.views.CumulusEmailValidationPage
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}


class UserController (
  cc: ControllerComponents,
  userService: UserService,
  eventService: EventService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  val settings: Settings
) extends Api(cc) {

  /**
    * The sign up action, to create a new account.
    */
  def signUp: Action[SignUpPayload] =
    Action.async(parseJson[SignUpPayload]) { implicit request =>
      val signInPayload = request.body

      userService.createUser(
        signInPayload.email,
        signInPayload.login,
        signInPayload.password
      ).toResult
    }

  /**
    * Sets the first password if the user needs one.
    */
  def setFirstPassword: Action[SetFirstPasswordPayload] =
    Action.async(parseJson[SetFirstPasswordPayload]) { implicit request =>
      val passwordPayload = request.body

      userService.setUserFirstPassword(
        passwordPayload.login,
        passwordPayload.password,
        passwordPayload.validationCode
      ).toResult
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

      userService.resendEmail(loginPayload.login, loginPayload.password).toResult
    }

  /**
    * Logs in the user using the provided login (account name) and password. After the password and login validation, a
    * new session will be created and stored. A token, containing the password (needed to decipher) and the session
    * unique ID will be returned and placed in the cookies of the response.
    */
  def login: Action[LoginPayload] =
    Action.async(parseJson[LoginPayload]) { implicit request =>
      val loginPayload = request.body

      for {
        user               <- EitherT(userService.checkLoginUser(loginPayload.login, loginPayload.password))
        sessionInformation <- EitherT(sessionService.createSession(request.remoteAddress, user))
        session            =  UserSession(user, sessionInformation, loginPayload.password)
        token              =  createJwtSession(session)
      } yield {
        Json.obj(
          "token" -> token.serialize,
          "user" -> Json.toJson(session.user)
        ).toResult.withAuthentication(token)
      }
    }

  /**
    * Returns information about the user performing the operation.
    */
  def me: Action[AnyContent] =
    AuthenticatedAction { implicit request =>
      request.authenticatedSession.user.toResult
    }

  /**
    * Changes the preferred lang of the current user.
    */
  def changeLang: Action[LangUpdatePayload] =
    AuthenticatedAction.async(parseJson[LangUpdatePayload]) { implicit request =>
      val langUpdatePayload = request.body

      userService.updateUserLanguage(langUpdatePayload.lang).toResult
    }

  /**
    * Changes the user's password.
    */
  def changePassword: Action[PasswordUpdatePayload] =
    AuthenticatedActionWith(refreshToken = false)(parseJson[PasswordUpdatePayload]).async { implicit request =>
      val passwordUpdatePayload = request.body

      userService
        .updateUserPassword(
          passwordUpdatePayload.previousPassword,
          passwordUpdatePayload.newPassword
        )
        .map(_.map { updatedUser =>
          val session = UserSession(updatedUser, request.authenticatedSession.information, passwordUpdatePayload.newPassword)
          val token   = createJwtSession(session)

          Json
            .obj(
              "token" -> token.refresh().serialize,
              "user" -> Json.toJson(session.user)
            )
            .toResult
            .withAuthentication(token)
        })
    }

  // TODO: route to change email (+email validation)

  /**
    * Lists the sessions of the current user.
    *
    * @param limit The maximum number of sessions to return. Used for pagination.
    * @param offset The offset of sessions to return. Used for pagination.
    */
  def listSessions(limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      // TODO allow filter to only active session, with a custom duration
      val pagination = QueryPagination(limit, offset)

      sessionService.listSessions(pagination).toResult
    }

  /**
    * List the events for the current user.
    * @param limit The maximum number of events to return. Used for pagination.
    * @param offset The offset of sessions to events. Used for pagination.
    */
  def listEvents(limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      // TODO allow filter type of event
      val pagination = QueryPagination(limit, offset)

      eventService.listEvents(pagination).toResult
    }

  /**
    * Shows the specified sessions.
    */
  def getSession(sessionId: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      sessionService.findSession(sessionId).toResult
    }

  /**
    * Revokes the specified session.
    *
    * @param sessionId The session to revoke.
    */
  def revokeSession(sessionId: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      if(request.authenticatedSession.information.id == sessionId)
        Future.successful(AppError.validation("validation.user.session-cant-revoke-self").toResult)
      else
        sessionService.revokeSession(sessionId, request.remoteAddress).toResult
    }

  /**
    * Logs out the user performing the operation, clearing the cookies and invalidating the session.
    */
  def logout: Action[AnyContent] =
    AuthenticatedActionWith(discardToken = true).async { implicit request =>
      sessionService
        .revokeSession(request.authenticatedSession.information.id, request.remoteAddress)
        .map { _ =>
          Redirect(routes.HomeController.index())
        }
    }

}
