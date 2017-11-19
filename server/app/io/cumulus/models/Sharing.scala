package io.cumulus.models

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.utils.{Base64, Crypto}
import play.api.libs.json.{Format, Json}

case class Sharing(
  id: UUID,
  code: String,
  password: Option[String],
  expiration: Option[LocalDateTime],
  needAuth: Boolean,
  owner: UUID,
  fsNode: UUID
)

object Sharing {

  def apply(
    password: Option[String],
    expiration: Option[LocalDateTime],
    needAuth: Boolean,
    owner: UUID,
    fsNode: UUID
  ): Sharing = Sharing(
    UUID.randomUUID(),
    Crypto.randomCode(16),
    password.map(p => Base64.encode(Crypto.hashSHA256(p))),
    expiration,
    needAuth,
    owner,
    fsNode
  )

  implicit val format: Format[Sharing] =
    Json.format[Sharing]

}