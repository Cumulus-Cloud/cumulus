package io.cumulus.controllers.payloads

import io.cumulus.models.fs.Path
import play.api.libs.json.{Json, Reads}

case class FsNodeUpdatePayload(
  path: Path
)

object FsNodeUpdatePayload {

  implicit val reader: Reads[FsNodeUpdatePayload] =
    Json.reads[FsNodeUpdatePayload]

}


