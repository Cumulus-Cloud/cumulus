package io.cumulus.controllers.payloads

import play.api.libs.json.{Json, Reads}

case class LoginPayload(
  login: String,
  password: String
)

object LoginPayload {

  implicit val reads: Reads[LoginPayload] =
    Json.reads[LoginPayload]

}
