package io.cumulus.controllers.payloads

import io.cumulus.models.Path
import play.api.libs.json.{Json, Reads}

case class DirectoryCreationPayload(
  path: Path
)

object DirectoryCreationPayload {

  implicit val reads: Reads[DirectoryCreationPayload] =
    Json.reads[DirectoryCreationPayload]

}
