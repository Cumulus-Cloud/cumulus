package io.cumulus.controllers

import java.util.UUID

import cats.data.EitherT
import cats.implicits._

import scala.concurrent.{ExecutionContext, Future}
import io.cumulus.controllers.payloads.{LoginPayload, SignUpPayload}
import io.cumulus.controllers.utils.UserAuthentication
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication._
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.User
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
    * The sign up action, to create new accounts.
    * @return
    */
  def signUp: Action[SignUpPayload] =
    Action.async(parseJson[SignUpPayload]) { implicit request =>
      ApiResponse {
        if(settings.management.allowSignUp) {
          val signInPayload = request.body
          val user = User.create(signInPayload.email, signInPayload.login, signInPayload.password)

          userService.createUser(user)
        } else
          Future.successful(Left(AppError.forbidden("validation.user.sign-up-deactivated")))
      }
    }

  /**
    * Validate the email of the user. This a static page and not an API endpoint.
    * @param userLogin The login of the user.
    * @param emailCode The secret code sent by mail.
    */
  def validateEmail(userLogin: String, emailCode: String): Action[AnyContent] =
    Action.async { implicit request =>
      userService.validateUserEmail(userLogin, emailCode).map { result =>
        Ok(CumulusEmailValidationPage(result))
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
    * Return information about the user performing the operation.
    */
  def me: Action[AnyContent] =
    AuthenticatedAction { implicit request =>
      ApiResponse {
        Right(request.authenticatedSession.user)
      }
    }

  /**
    * List the sessions of the current user.
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
    * Show the specified sessions.
    */
  def getSession(sessionId: UUID): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        sessionService.findSession(sessionId)
      }
    }

  /**
    * Revoke the specified session.
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
