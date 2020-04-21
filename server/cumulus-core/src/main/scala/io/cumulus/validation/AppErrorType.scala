package io.cumulus.validation

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry}


sealed abstract class AppErrorType(val status: Int) extends EnumEntry

/**
  * Type of error, used to know which status to return.
  */
object AppErrorType extends Enum[AppErrorType] {

  /** Used when a resource is not found. */
  case object NotFound extends AppErrorType(404)

  /** Used when the user should be logged in. */
  case object Unauthorized extends AppErrorType(401)

  /** Used when the user has no sufficient rights. */
  case object Forbidden extends AppErrorType(403)

  /** Used when the information provided are invalid. */
  case object Validation extends AppErrorType(400)

  /** Used when the information provided are not acceptable (i.e. invalid range). */
  case object NotAcceptable extends AppErrorType(406)

  /** Used for any unexpected error. */
  case object Technical extends AppErrorType(500)


  override val values: immutable.IndexedSeq[AppErrorType] = findValues

}
