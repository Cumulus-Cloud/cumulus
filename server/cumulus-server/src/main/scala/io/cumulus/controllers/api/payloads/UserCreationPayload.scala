package io.cumulus.controllers.api.payloads

import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{Reads, __}


case class UserCreationPayload(
  login: String,
  email: String
)

object UserCreationPayload {

  implicit val reader: Reads[UserCreationPayload] =
    (
      (__ \ "login").read[String](minLength[String](4) keepAnd maxLength[String](64)) and
      (__ \ "email").read[String](pattern("^.+@.+$".r) keepAnd maxLength[String](255))
    )(UserCreationPayload.apply _)

}
