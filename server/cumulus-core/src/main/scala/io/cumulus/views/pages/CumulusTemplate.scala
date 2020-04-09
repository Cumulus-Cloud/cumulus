package io.cumulus.views.pages

import io.cumulus.i18n.Lang
import io.cumulus.views.View
import scalatags.Text.all._
import scalatags.Text.tags2.title

trait CumulusTemplate extends View {

  protected def pageTitle(implicit l: Lang): String =
    messages("view.title")

  protected def pageHead(implicit l: Lang): Seq[Tag] =
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

  protected def pageBody(implicit l: Lang): Seq[Tag]

  protected def content(implicit l: Lang): Tag = {
    html(
      head(pageHead),
      body(pageBody)
    )
  }

  def render(implicit l: Lang): String =
    content.render

}
