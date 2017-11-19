package io.cumulus.controllers.payloads.fs

import io.cumulus.models.Path
import play.api.libs.json._

sealed trait FsOperation {
  def operationType: FsOperationType
}

object FsOperation {

  implicit val reads: Reads[FsOperation] = {
    case jsObject: JsObject =>

      (jsObject \ "operation")
        .asOpt[String]
        .flatMap(FsOperationType.withNameInsensitiveOption) match {
        case Some(FsOperationType.CREATE) =>
          FsOperationCreate.format.reads(jsObject)
        case Some(FsOperationType.MOVE) =>
          FsOperationMove.format.reads(jsObject)
        case Some(FsOperationType.SHARE_LINK) =>
          FsOperationShareLink.format.reads(jsObject)
        case Some(FsOperationType.DELETE) =>
          FsOperationDelete.format.reads(jsObject)
        case other =>
          JsError(__ \ "nodeType", JsonValidationError("validation.fs-operation.unknown-type", other.getOrElse("None")))
      }
    case _ =>
      JsError("validation.parsing.cannot-parse")
  }

  implicit val writes: OWrites[FsOperation] = {
    case fsOperationCreate: FsOperationCreate =>
      FsOperationCreate.format.writes(fsOperationCreate)
    case fsOperationMove: FsOperationMove =>
      FsOperationMove.format.writes(fsOperationMove)
    case fsOperationShareLink: FsOperationShareLink =>
      FsOperationShareLink.format.writes(fsOperationShareLink)
    case fsOperationDelete: FsOperationDelete =>
      FsOperationDelete.format.writes(fsOperationDelete)
  }

  implicit val format: OFormat[FsOperation] =
    OFormat(reads, writes)

}

case class FsOperationCreate(foo: Option[String]) extends FsOperation {
  def operationType: FsOperationType = FsOperationType.CREATE
}

object FsOperationCreate {

  implicit val format: OFormat[FsOperationCreate] =
    Json.format[FsOperationCreate]

}

case class FsOperationMove(
  to: Path
) extends FsOperation {
  def operationType: FsOperationType = FsOperationType.MOVE
}

object FsOperationMove {

  implicit val format: OFormat[FsOperationMove] =
    Json.format[FsOperationMove]

}

case class FsOperationShareLink(
  passwordProtection: Option[String],
  duration: Option[Int],
  needAuthentication: Option[Boolean]
) extends FsOperation {
  def operationType: FsOperationType = FsOperationType.SHARE_LINK
}

object FsOperationShareLink {

  implicit val format: OFormat[FsOperationShareLink] =
    Json.format[FsOperationShareLink]

}

case class FsOperationDelete(foo: Option[String]) extends FsOperation {
  def operationType: FsOperationType = FsOperationType.DELETE
}

object FsOperationDelete {

  implicit val format: OFormat[FsOperationDelete] =
    Json.format[FsOperationDelete]

}
