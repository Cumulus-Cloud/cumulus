package io.cumulus.controllers.payloads

import play.api.libs.json.{Json, Reads}

case class LangUpdatePayload(
  lang: String
)

object LangUpdatePayload {

  implicit val reads: Reads[LangUpdatePayload] =
    Json.reads[LangUpdatePayload]

}
