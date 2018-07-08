package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import controllers.Assets.Asset
import controllers.AssetsMetadata
import jsmessages.JsMessages
import play.api.http.HttpErrorHandler
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import play.api.{Environment, Mode}

class Assets(
  environment: Environment,
  assetsMetadata: AssetsMetadata,
  httpErrorHandler: HttpErrorHandler,
  jsMessages: JsMessages,
  cc: ControllerComponents
)(implicit ec: ExecutionContext)
  extends AbstractController(cc) {

  lazy val assets         = new controllers.Assets(httpErrorHandler, assetsMetadata)
  lazy val externalAssets = new controllers.ExternalAssets(environment)

  /**
    * Fixes dev mode assets being served as classloader resources and sometimes being outdated.
    */
  def versioned(file: Asset): Action[AnyContent] = {
    if (environment.mode == Mode.Prod)
      assets.versioned(file.name)
    else
      assets.at(file = file.name)
  }

  val favicon: Action[AnyContent] =
    assets.versioned("favicon.ico")

  def messages: Action[Unit] = Action(parse.empty) { implicit req =>
    Ok(jsMessages(Some("window.Messages"))(messagesApi.preferred(req)))
  }

}
