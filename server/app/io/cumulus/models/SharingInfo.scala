package io.cumulus.models

import io.cumulus.models.fs.FsNode
import play.api.libs.json.{Json, OWrites}

case class SharingInfo(
  sharing: Sharing,
  fsNode: FsNode
)

object SharingInfo {

  implicit val writer: OWrites[SharingInfo] =
    Json.writes[SharingInfo]

}
