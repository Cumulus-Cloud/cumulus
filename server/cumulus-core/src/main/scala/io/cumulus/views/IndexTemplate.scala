package io.cumulus.views

import play.api.i18n.Messages
import play.api.libs.json.{JsValue, Json}
import scalatags.Text.all._
import scalatags.Text.tags2.title

/**
  * Base for all templates of the application.
  */
trait IndexTemplate extends View {

  def messages: Messages

  protected val pageTitle: String =
    messages("view.title")

  protected def pageHead: Seq[Tag] =
    Seq(
      title(pageTitle),
      meta(
        charset := "utf-8"
      ),
      meta(
        name            := "viewport",
        attr("content") := "width=device-width"
      ),
      link(
        rel   := "stylesheet",
        href  := "https://fonts.googleapis.com/css?family=Roboto:300,400,500"
      ),
      link(
        rel   := "stylesheet",
        href  := "https://fonts.googleapis.com/icon?family=Material+Icons"
      ),
      tag("style")(
        tpe := "text/css",
        "form { margin-bottom: 0; }" +
        "body { margin: 0; padding: 0; height:100%; }"
      ),
      link(
        rel   := "icon",
        media := "image/x-icon",
        href  := "favicon.ico"
      )
    )

  protected def info: Map[String, JsValue]

  protected def pageBody: Seq[Tag] = {
    Seq(
      div(
        id := "app",
        style := "min-height:100%;"
      ),
      div(
        id := "app-dragged"
      ),
      script(
        raw(info.map { case (key, jsValue) => s"var $key = ${Json.asciiStringify(jsValue)};" }.mkString(""))
      ),
      script(
        src := "/assets/bundle.js"
      )
    )
  }

  lazy val content: Tag = {
    html(
      head(pageHead),
      body(pageBody)
    )
  }

}
