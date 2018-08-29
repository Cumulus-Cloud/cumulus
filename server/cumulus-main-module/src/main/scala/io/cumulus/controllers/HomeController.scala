package io.cumulus.controllers

import io.cumulus.core.controllers.utils.api.ApiUtils
import play.api.mvc._


class HomeController(
  cc: ControllerComponents,
  assets: Assets
) extends AbstractController(cc) with ApiUtils {

  val index: Action[AnyContent] =
    assets.assets.versioned("index.html")

  def indexWithPath(path: String): Action[AnyContent] =
    assets.assets.versioned("index.html")

}
