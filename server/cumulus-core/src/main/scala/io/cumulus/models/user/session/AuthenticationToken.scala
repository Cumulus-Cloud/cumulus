package io.cumulus.models.user.session

import java.util.UUID

import play.api.libs.json.{Format, Json}


case class AuthenticationToken(
  sessionId: UUID,
  password: String
)

object AuthenticationToken {

  def create(userSession: UserSession): AuthenticationToken =
    AuthenticationToken(userSession.information.id, userSession.password)

  implicit def format: Format[AuthenticationToken] =
    Json.format[AuthenticationToken]

}
