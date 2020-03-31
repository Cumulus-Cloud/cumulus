package io.cumulus.controllers.api.payloads

import java.util.UUID

import play.api.libs.json.{Json, Reads}


case class SharingCreationPayload(
  nodeId: UUID,
  passwordProtection: Option[String],
  duration: Option[Int],
  needAuthentication: Option[Boolean]
)

object SharingCreationPayload {

  implicit val reader: Reads[SharingCreationPayload] =
    Json.reads[SharingCreationPayload]

}
