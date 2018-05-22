package io.cumulus.controllers

import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.views.CumulusAppPage
import play.api.mvc._


class HomeController(
  cc: ControllerComponents
) extends AbstractController(cc) with ApiUtils {

  def index = Action { implicit request =>
    Ok(CumulusAppPage())
  }

}
