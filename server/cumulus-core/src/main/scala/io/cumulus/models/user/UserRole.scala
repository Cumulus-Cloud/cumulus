package io.cumulus.models.user

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}

import scala.collection.immutable

sealed abstract class UserRole extends EnumEntry

/**
  * Role of an user.
  */
object UserRole extends Enum[UserRole] with PlayJsonEnum[UserRole] {

  /** Basic user role. */
  case object User extends UserRole

  /** Administrator role. */
  case object Admin extends UserRole

  override val values: immutable.IndexedSeq[UserRole] = findValues
}
