package io.cumulus.models.fs

import play.api.libs.json.{Format, Json}


case class FsNodeIndex(
  path: String,
  nodeType: FsNodeType
)

object FsNodeIndex {

  implicit val format: Format[FsNodeIndex] =
    Json.format[FsNodeIndex]

}
