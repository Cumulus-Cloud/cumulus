package io.cumulus.controllers.app.views

import play.api.i18n.Messages
import scalatags.Text.all._
import scalatags.Text.tags2.title


/**
  * Base for all templates of the application.
  */
trait CumulusTemplate extends View {

  def messages: Messages

  protected val pageTitle: String =
    messages("view.title")

  protected def pageHead: Seq[Tag] =
    Seq(
      title(pageTitle),
      meta(
        name            := "viewport",
        attr("content") := "width=device-width, initial-scale=1"
      ),
      link(
        rel   := "stylesheet",
        media := "screen",
        href  := "assets/main.css" // Not using routes, because this will also be used in other modules
      ),
      link(
        rel   := "icon",
        media := "image/x-icon",
        href  := "favicon.ico"
      ),
      link(
        rel  := "stylesheet",
        href := "https://fonts.googleapis.com/css?family=Lato"
      )
    )

  protected def pageBody: Seq[Tag]

  lazy val content: Tag = {
    html(
      head(pageHead),
      body(pageBody)
    )
  }

}
