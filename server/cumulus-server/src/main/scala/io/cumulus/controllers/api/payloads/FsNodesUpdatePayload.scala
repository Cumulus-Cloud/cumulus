package io.cumulus.controllers.api.payloads

import java.util.UUID

import enumeratum.{Enum, EnumEntry, EnumFormats}
import io.cumulus.models.fs.Path
import io.cumulus.utils.Enum._
import play.api.libs.json.{JsError, JsValue, Json, Reads, __}

import scala.collection.immutable


sealed abstract class FsNodeOperation extends EnumEntry

object FsNodeOperation extends Enum[FsNodeOperation] {

  case object Create extends FsNodeOperation
  case object Share extends FsNodeOperation
  case object Displacement extends FsNodeOperation
  case object Deletion extends FsNodeOperation

  implicit val reads: Reads[FsNodeOperation] =
    EnumFormats.reads[FsNodeOperation](FsNodeOperation, insensitive = true)

  override val values: immutable.IndexedSeq[FsNodeOperation] =
    findValues

}


sealed trait FsNodesUpdatePayload {
  val operation: FsNodeOperation
}

object FsNodesUpdatePayload {

  implicit val reader: Reads[FsNodesUpdatePayload] =
    (json: JsValue) => {
      enumReader[FsNodeOperation]("operation")
        .reads(json)
        .flatMap {
          case FsNodeOperation.Displacement =>
            json.validate[FsNodesDisplacementPayload]
          case FsNodeOperation.Deletion =>
            json.validate[FsNodesDeletionPayload]
          case _ =>
            JsError(__ \ "operation", "error.not-implemented")
        }
    }

}

case class FsNodesDisplacementPayload(
  nodes: Seq[UUID],
  destination: Path
) extends FsNodesUpdatePayload {

  override val operation: FsNodeOperation =
    FsNodeOperation.Displacement

}

object FsNodesDisplacementPayload {

  implicit val reader: Reads[FsNodesDisplacementPayload] =
    Json.reads[FsNodesDisplacementPayload]

}


case class FsNodesDeletionPayload(
  nodes: Seq[UUID],
  deleteContent: Boolean
) extends FsNodesUpdatePayload {

  override val operation: FsNodeOperation =
    FsNodeOperation.Deletion

}

object FsNodesDeletionPayload {

  implicit val reader: Reads[FsNodesDeletionPayload] =
    Json.reads[FsNodesDeletionPayload]

}

// TODO sharing
// TODO other operations? Create etc..
