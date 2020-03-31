package io.cumulus.controllers.api

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import cats.data.EitherT
import cats.implicits._
import io.cumulus.{Authenticator, _}
import io.cumulus.controllers.api.payloads._
import io.cumulus.i18n.Messages
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.services.{EventService, SessionService, UserService}
import io.cumulus.validation.AppError
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext


class UserController (
  userService: UserService,
  eventService: EventService,
  sessionService: SessionService,
  tokenService: TokenService[AuthenticationToken],
  val auth: Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends ApiComponent {

  val routes: Route =
    concat(
      signUp,
      setFirstPassword,
      validateEmail,
      resendValidationEmail,
      login,
      logout,
      me,
      changeLang,
      changePassword,
      listSessions,
      getSession,
      revokeSession,
      listEvents
    )

  /**
    * The sign up action, to create a new account.
    */
  def signUp: Route =
    (post & path("api" / "users" / "signup") & payload[SignUpPayload]) { payload =>
      withContext { implicit ctx =>
        userService
          .createUser(
            payload.email,
            payload.login,
            payload.password
          )
          .toResultAs(StatusCodes.Created)
      }
    }

  /**
    * Sets the first password if the user needs one.
    */
  def setFirstPassword: Route =
    (post & path("api" / "users" / "firstPassword") & payload[SetFirstPasswordPayload]) { payload =>
      withAuthentication { implicit ctx =>
        userService
          .setUserFirstPassword(
            payload.login,
            payload.password,
            payload.validationCode
          )
          .toResult
      }
    }

  /**
    * Validates the email of the user. This a static page and not an API endpoint.
    */ // TODO move, not in the api
  def validateEmail: Route = ??? /*
   (userLogin: String, validationCode: String):
    Action.async { implicit request =>
      userService
        .validateUserEmail(userLogin, validationCode)
        .map { result =>
          // TODO better templating (render method + service ?)
          Ok(CumulusEmailValidationPage(result))
        }
    }*/

  /**
    * Resend the validation email to the user. Only works with user-created account waiting for an email validation.
    */
  def resendValidationEmail: Route =
    (post & path("api" / "users" / "emailValidationResend") & payload[LoginPayload]) { payload =>
      withContext { implicit ctx =>
        userService
          .resendEmail(payload.login, payload.password)
          .toResult
      }
    }

  /**
    * Logs in the user using the provided login (account name) and password. After the password and login validation, a
    * new session will be created and stored. A token, containing the password (needed to decipher) and the session
    * unique ID will be returned and placed in the cookies of the response.
    */
  def login: Route =
    (post & path("api" / "users" / "login") & extractClientIP & payload[LoginPayload]) { (ip, payload) =>
      withContext { implicit ctx =>
        val ipAddress = ip.toOption.map(_.getHostAddress).getOrElse("0.0.0.0")

        val result =
          for {
            user <- EitherT(userService.checkLoginUser(payload.login, payload.password))
            sessionInformation <- EitherT(sessionService.createSession(ipAddress, user))
            session = UserSession(user, sessionInformation, payload.password)
            token = tokenService.encode(AuthenticationToken.create(session))
          } yield (session, token)

        result
          .map {
            case (session, token) =>
              setAuthentication(session) {
                Json.obj(
                  "token" -> token,
                  "user" -> Json.toJson(session.user)
                ).toResult
              }
          }
          .toResult
      }
    }

  /**
    * Returns information about the user performing the operation.
    */
  def me: Route =
    (get & path("api" / "users" / "me")) {
      withAuthentication { implicit ctx =>
        ctx.user.toResult
      }
    }

  /**
    * Changes the preferred lang of the current user.
    */
  def changeLang: Route =
    (post & path("api" / "users" / "lang") & payload[LangUpdatePayload]) { payload =>
      withAuthentication { implicit ctx =>
        userService.updateUserLanguage(payload.lang).toResult
      }
    }

  /**
    * Changes the user's password.
    */
  def changePassword: Route =
    (post & path("api" / "users" / "password") & payload[PasswordUpdatePayload]) { payload =>
      withAuthentication { implicit ctx =>
        userService
          .updateUserPassword(
            payload.previousPassword,
            payload.newPassword
          )
          .map(_.map { updatedUser =>
            val session = UserSession(updatedUser, ctx.session.information, payload.newPassword)
            val token = tokenService.encode(AuthenticationToken.create(session))

            setAuthentication(session) {
              Json.obj(
                "token" -> token,
                "user" -> Json.toJson(session.user)
              ).toResult
            }

          })
          .toResult
      }
    }

  // TODO: route to change email (+email validation)

  /**
    * Lists the sessions of the current user.
    */
  def listSessions: Route =
    (get & path("api" / "users" / "sessions") & paginationParams) { pagination =>
      withAuthentication { implicit ctx =>
        // TODO allow filter to only active session, with a custom duration
        sessionService.listSessions(pagination).toResult
      }
    }

  /**
    * List the events for the current user.
    */
  def listEvents: Route =
    (get & path("api" / "users" / "events") & paginationParams) { pagination =>
      withAuthentication { implicit ctx =>
        // TODO allow filter type of event
        eventService.listEvents(pagination).toResult
      }
    }

  /**
    * Shows the specified sessions.
    */
  def getSession: Route =
    (get & path("sessions" / JavaUUID)) { sessionId =>
      withAuthentication { implicit ctx =>
        sessionService.findSession(sessionId).toResult
      }
    }

  /**
    * Revokes the specified session.
    */
  def revokeSession: Route =
    (post & path("api" / "users" / "sessions" / JavaUUID / "revoke") & extractClientIP) { (sessionId, ip) =>
      withAuthentication { implicit ctx =>
        val ipAddress = ip.toOption.map(_.getHostAddress).getOrElse("0.0.0.0")

        if (ctx.session.information.id == sessionId)
          AppError.validation("validation.user.session-cant-revoke-self").toResult
        else
          sessionService.revokeSession(sessionId, ipAddress).toResult
      }
    }

  /**
    * Logs out the user performing the operation, clearing the cookies and invalidating the session.
    */
  def logout: Route =
    (post & path("api" / "users" / "logout")) {
      withAuthentication { implicit ctx =>
        sessionService
          .revokeSession(ctx.session.information.id, ctx.ip.getHostAddress)
          .map { _ =>
            removeAuthentication {
              redirect("/", StatusCodes.TemporaryRedirect)
            }
          }
          .toResult
      }
    }

}
