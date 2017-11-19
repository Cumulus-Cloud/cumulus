package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}

import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.User
import play.api.mvc._


class HomeController (
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[User] with ApiUtils with BodyParserJson {

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
