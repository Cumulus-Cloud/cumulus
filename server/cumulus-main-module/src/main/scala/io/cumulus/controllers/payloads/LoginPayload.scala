package io.cumulus.controllers.payloads

import play.api.libs.functional.syntax._
import play.api.libs.json.Reads.{minLength, _}
import play.api.libs.json.{Reads, __}

case class LoginPayload(
  login: String,
  password: String
)

object LoginPayload {

  implicit val reads: Reads[LoginPayload] = (
    (__ \ "login").read[String](minLength[String](4) keepAnd maxLength[String](64)) and
    (__ \ "password").read[String](minLength[String](4) keepAnd maxLength[String](64))
  )(LoginPayload.apply _)

}
