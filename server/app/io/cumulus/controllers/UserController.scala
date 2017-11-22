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
        val session = UserSession(authenticatedUser, signInPayload.password)
        val token = createJwtSession(session)
        Ok(Json.obj(
          "token" -> token.refresh().serialize,
          "user" -> Json.toJson(authenticatedUser)(User.apiWrite)
        )).withAuthentication(token)
      case Left(error) =>
        toApiError(error)
    }
  }

  def login = Action.async(parseJson[LoginPayload]) { implicit request =>
    val loginPayload = request.body

    userService.loginUser(loginPayload.login, loginPayload.password).map {
      case Right(authenticatedUser) =>
        val session = UserSession(authenticatedUser, loginPayload.password)
        val token = createJwtSession(session)
        Ok(Json.obj(
          "token" -> token.refresh().serialize,
          "user" -> Json.toJson(authenticatedUser)(User.apiWrite)
        )).withAuthentication(token)
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
