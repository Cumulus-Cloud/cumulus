package io.cumulus.models.user

import play.api.libs.json.{Format, Json}

case class UserUpdate(
  activated: Option[Boolean],
  email: Option[String],
  emailValidation: Option[Boolean],
  login: Option[String]
)

object UserUpdate {

  implicit val format: Format[UserUpdate] =
    Json.format[UserUpdate]

}