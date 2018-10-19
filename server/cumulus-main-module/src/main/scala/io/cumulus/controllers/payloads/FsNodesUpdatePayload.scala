package io.cumulus.controllers.payloads

import java.util.UUID

import io.cumulus.models.Path
import play.api.libs.json.{Json, Reads}


sealed trait FsNodesUpdatePayload {
  val nodes: Seq[UUID]
}

object FsNodesUpdatePayload {

  implicit val reader: Reads[FsNodesUpdatePayload] =
    Json.reads[FsNodesUpdatePayload]

}


case class FsNodesDisplacementPayload(
  nodes: Seq[UUID],
  destination: Path
) extends FsNodesUpdatePayload

object FsNodesDisplacementPayload {

  implicit val reader: Reads[FsNodesDisplacementPayload] =
    Json.reads[FsNodesDisplacementPayload]

}


case class FsNodesDeletionPayload(
  nodes: Seq[UUID],
  deleteContent: Boolean
) extends FsNodesUpdatePayload

object FsNodesDeletionPayload {

  implicit val reader: Reads[FsNodesDeletionPayload] =
    Json.reads[FsNodesDeletionPayload]

}

// TODO sharing
