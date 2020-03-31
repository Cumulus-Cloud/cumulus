package io.cumulus.views

import io.cumulus.Settings
import io.cumulus.i18n.LangMessages
import io.cumulus.models.fs.DirectoryWithContent
import io.cumulus.models.user.User
import play.api.libs.json.{JsNull, JsValue, Json}

case class IndexPage(
  maybeUser: Option[User],
  maybeDirectory: Option[DirectoryWithContent]
)(implicit
  val settings: Settings,
  val langMessages: LangMessages
) extends IndexTemplate {

  override protected def info: Map[String, JsValue] = {
    Map(
      "user" -> maybeUser.map(user => Json.toJson(user)).getOrElse(JsNull),
      "directoryWithContent" -> maybeDirectory.map(dir => Json.toJson(dir)).getOrElse(JsNull),
      "error" -> JsNull
    )
  }

}
