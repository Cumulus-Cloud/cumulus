package io.cumulus.models.sharing

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.json.JsonFormat._
import io.cumulus.core.utils.Crypto
import play.api.libs.functional.syntax._
import play.api.libs.json._

case class Sharing(
  id: UUID,
  reference: String,
  expiration: Option[LocalDateTime],
  owner: UUID,
  fsNode: UUID,
  security: SharingSecurity,
  fileSecurity: Map[UUID, FileSharingSecurity]
)

object Sharing {

  def create(
    expiration: Option[LocalDateTime],
    owner: UUID,
    fsNode: UUID,
    security: SharingSecurity,
    fileSecurity: Map[UUID, FileSharingSecurity]
  ): Sharing =
    Sharing(
      UUID.randomUUID(),
      Crypto.randomCode(16),
      expiration,
      owner,
      fsNode,
      security,
      fileSecurity
    )

  val apiWrite: OWrites[Sharing] =(
    (__ \ "id").write[String] and
    (__ \ "reference").write[String] and
    (__ \ "expiration").write[Option[LocalDateTime]] and
    (__ \ "owner").write[String] and
    (__ \ "fsNode").write[String]
  )(sharing =>
    (
      sharing.id.toString,
      sharing.reference,
      sharing.expiration,
      sharing.owner.toString,
      sharing.fsNode.toString
    )
  )

  implicit val format: OFormat[Sharing] =
    OFormat(Json.reads[Sharing], apiWrite)

  val internalFormat: OFormat[Sharing] =
    Json.format[Sharing]

}
