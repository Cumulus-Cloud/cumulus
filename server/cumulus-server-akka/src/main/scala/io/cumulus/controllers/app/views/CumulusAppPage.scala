package io.cumulus.controllers.app.views

import play.api.i18n.Messages
import scalatags.Text.all._

/**
  * Main page of the app, handled by react.
  */
case class CumulusAppPage()(implicit val messages: Messages) extends CumulusTemplate {

  override protected lazy val pageBody: Seq[Tag] =
    Seq(
      div(id := "app"),
      script(src := "/assets/messages.js"),
      script(src := "/assets/main.js")
    )

}
