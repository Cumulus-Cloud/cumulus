package io.cumulus.controllers.payloads

import play.api.libs.functional.syntax._
import play.api.libs.json.Reads.{minLength, pattern, _}
import play.api.libs.json.{Reads, __}

case class AdminCreationPayload(
  login: String,
  email: String,
  password: String
)

object AdminCreationPayload {

  implicit val reads: Reads[AdminCreationPayload] =
    (
      (__ \ "login").read[String](minLength[String](4) keepAnd maxLength[String](64)) and
      (__ \ "email").read[String](pattern("^.+@.+$".r) keepAnd maxLength[String](255)) and
      (__ \ "password").read[String](minLength[String](4))
    )(AdminCreationPayload.apply _)

}
