package io.cumulus.models.fs

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}
import io.cumulus.core.persistence.anorm.AnormEnum

sealed abstract class FsNodeType extends EnumEntry

object FsNodeType extends Enum[FsNodeType] with PlayJsonEnum[FsNodeType] with AnormEnum[FsNodeType] {

  case object DIRECTORY extends FsNodeType
  case object FILE extends FsNodeType

  override val values: immutable.IndexedSeq[FsNodeType] = findValues

}
