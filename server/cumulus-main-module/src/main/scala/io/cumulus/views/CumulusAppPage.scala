package io.cumulus.views

import scalatags.Text.all._

/**
  * Main page of the app, handled by react.
  */
object CumulusAppPage extends CumulusTemplate {

  override protected lazy val pageBody: Seq[Tag] =
    Seq(
      div(id := "app"),
      script(src := "/assets/messages.js"),
      script(src := "/assets/main.js")
    )

}
