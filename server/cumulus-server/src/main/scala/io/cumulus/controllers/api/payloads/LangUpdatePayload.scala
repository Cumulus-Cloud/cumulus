package io.cumulus.controllers.api.payloads

import play.api.libs.json.{Json, Reads}

case class LangUpdatePayload(
  lang: String
)

object LangUpdatePayload {

  implicit val reader: Reads[LangUpdatePayload] =
    Json.reads[LangUpdatePayload]

}
