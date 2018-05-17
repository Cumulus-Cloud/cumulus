package io.cumulus.controllers

import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.user.UserSession
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}


class HomeController(
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with BodyParserJson {

  def index = Action {
    Ok(io.cumulus.views.html.index())
  }

  def testLogin = Action {
    Ok(io.cumulus.views.html.test.login())
  }

  def test = AuthenticatedAction.withErrorHandler { implicit request =>
    Ok(io.cumulus.views.html.test.index())
  } { _: Request[_] =>
    Future.successful(Redirect(routes.HomeController.testLogin()))
  }

}
