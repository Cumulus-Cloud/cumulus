package io.cumulus.models.task

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}
import io.cumulus.core.persistence.anorm.AnormEnum

import scala.collection.immutable


sealed abstract class TaskStatus extends EnumEntry

object TaskStatus extends Enum[TaskStatus] with PlayJsonEnum[TaskStatus] with AnormEnum[TaskStatus] {

  case object WAITING extends TaskStatus
  case object IN_PROGRESS extends TaskStatus
  case object DONE extends TaskStatus
  case object FAILED extends TaskStatus

  override val values: immutable.IndexedSeq[TaskStatus] = findValues
}
