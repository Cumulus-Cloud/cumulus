package io.cumulus.controllers.api.payloads

import play.api.libs.json.{Json, Reads}

case class LoginPayload(
  login: String,
  password: String
)

object LoginPayload {

  implicit val reader: Reads[LoginPayload] =
    Json.reads[LoginPayload]

}
