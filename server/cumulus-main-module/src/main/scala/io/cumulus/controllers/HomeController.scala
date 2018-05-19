package io.cumulus.controllers

import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.user.UserSession
import io.cumulus.views.CumulusAppPage
import play.api.mvc._


class HomeController(
  cc: ControllerComponents
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with BodyParserJson {

  def index = Action { implicit request =>
    Ok(CumulusAppPage())
  }

}
