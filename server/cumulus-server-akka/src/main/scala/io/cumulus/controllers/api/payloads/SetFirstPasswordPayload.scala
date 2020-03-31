package io.cumulus.controllers.api.payloads

import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{Reads, __}


case class SetFirstPasswordPayload(
  login: String,
  password: String,
  validationCode: String
)


object SetFirstPasswordPayload {

  implicit val reader: Reads[SetFirstPasswordPayload] =
    (
      (__ \ "login").read[String] and
      (__ \ "password").read[String](minLength[String](4) keepAnd maxLength[String](64)) and
      (__ \ "validationCode").read[String]
    )(SetFirstPasswordPayload.apply _)

}
