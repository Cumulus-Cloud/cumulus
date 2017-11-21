package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import io.cumulus.controllers.payloads.{LoginPayload, SignUpPayload}
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.authentication.Authentication._
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.{User, UserSession}
import io.cumulus.persistence.services.UserService
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}

class UserController (
  cc: ControllerComponents,
  userService: UserService
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with BodyParserJson {

  def signUp = Action.async(parseJson[SignUpPayload]) { implicit request =>
    val signInPayload = request.body
    val user = User(signInPayload.email, signInPayload.login, signInPayload.password)

    userService.createUser(user).map {
      case Right(authenticatedUser) =>
        // If the sign up is successful, redirect to the index page
        val session = UserSession(authenticatedUser, signInPayload.password)
        val token = createJwtSession(session)
        Redirect(routes.HomeController.index()).withAuthentication(token)
      case Left(error) =>
        toApiError(error)
    }
  }

  def login = Action.async(parseJson[LoginPayload]) { implicit request =>
    val loginPayload = request.body

    userService.loginUser(loginPayload.login, loginPayload.password).map {
      case Right(authenticatedUser) =>
        // If the authentication is successful, redirect to the index page
        val session = UserSession(authenticatedUser, loginPayload.password)
        val token = createJwtSession(session)
        Redirect(routes.HomeController.index()).withAuthentication(token)
      case Left(error) =>
        toApiError(error)
    }

  }

  def me = AuthenticatedAction { implicit request =>
    Ok(Json.toJson(request.user.user)(User.apiWrite))
  }

  def logout = Action { implicit request =>
    Redirect(routes.HomeController.index()).withoutAuthentication
  }

}
