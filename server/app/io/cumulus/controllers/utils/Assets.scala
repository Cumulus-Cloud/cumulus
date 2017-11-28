package io.cumulus.controllers.utils

import scala.concurrent.ExecutionContext

import jsmessages.JsMessages
import controllers.Assets.Asset
import controllers.AssetsMetadata
import play.api.{Environment, Mode}
import play.api.http.HttpErrorHandler
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

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
  def versioned(path: String, file: Asset): Action[AnyContent] =
    if (environment.mode == Mode.Prod)
      assets.versioned(path, file)
    else
      externalAssets.at(path.drop(1), file.name)

  val favicon: Action[AnyContent] = assets.versioned(path = "/public", "favicon.ico")

  def messages: Action[Unit] = Action(parse.empty) { implicit req =>
    Ok(jsMessages(Some("window.Messages"))(messagesApi.preferred(req)))
  }

}
