package io.cumulus.controllers.payloads

import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{Reads, __}


case class PasswordUpdatePayload(
  previousPassword: String,
  newPassword: String
)

object PasswordUpdatePayload {

  implicit val reader: Reads[PasswordUpdatePayload] =
    (
      (__ \ "previousPassword").read[String](minLength[String](4) keepAnd maxLength[String](64)) and
      (__ \ "newPassword").read[String](minLength[String](4) keepAnd maxLength[String](64))
    )(PasswordUpdatePayload.apply _)

}
