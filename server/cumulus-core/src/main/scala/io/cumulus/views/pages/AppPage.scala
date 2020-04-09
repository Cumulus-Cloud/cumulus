package io.cumulus.views.pages

import io.cumulus.Settings
import io.cumulus.i18n.{Lang, Messages}
import io.cumulus.models.fs.DirectoryWithContent
import io.cumulus.models.user.User
import play.api.libs.json.{JsNull, JsValue, Json}
import scalatags.Text.all._


case class AppPage(
  maybeUser: Option[User],
  maybeDirectory: Option[DirectoryWithContent]
)(implicit
  val messages: Messages,
  val settings: Settings
) extends CumulusTemplate {

  private val info: Map[String, JsValue] = {
    Map(
      "user" -> maybeUser.map(user => Json.toJson(user)).getOrElse(JsNull),
      "directoryWithContent" -> maybeDirectory.map(dir => Json.toJson(dir)).getOrElse(JsNull),
      "error" -> JsNull
    )
  }

  protected def pageBody(implicit l: Lang): Seq[Tag] = {
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
        src := "/assets/messages.js"
      ),
      script(
        src := "/assets/bundle.js"
      )
    )
  }

}
