package io.cumulus.controllers.payloads.fs

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}

sealed abstract class FsOperationType extends EnumEntry

object FsOperationType extends Enum[FsOperationType] with PlayJsonEnum[FsOperationType] {

  case object CREATE       extends FsOperationType
  case object MOVE         extends FsOperationType
  case object SHARE_LINK   extends FsOperationType
  case object SHARE_DELETE extends FsOperationType
  case object DELETE       extends FsOperationType

  override val values: immutable.IndexedSeq[FsOperationType] = findValues

}
