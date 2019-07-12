package io.cumulus.core.validation

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry}
import play.api.http.Status._


sealed abstract class AppErrorType(val status: Int) extends EnumEntry

/**
  * Type of error, used to know which status to return.
  */
object AppErrorType extends Enum[AppErrorType] {

  /** Used when a resource is not found. */
  case object NotFound extends AppErrorType(NOT_FOUND)

  /** Used when the user should be logged in. */
  case object Unauthorized extends AppErrorType(UNAUTHORIZED)

  /** Used when the user has no sufficient rights. */
  case object Forbidden extends AppErrorType(FORBIDDEN)

  /** Used when the information provided are invalid. */
  case object Validation extends AppErrorType(BAD_REQUEST)

  /** Used when the information provided are not acceptable (i.e. invalid range). */
  case object NotAcceptable extends AppErrorType(NOT_ACCEPTABLE)

  /** Used for any unexpected error. */
  case object Technical extends AppErrorType(INTERNAL_SERVER_ERROR)


  override val values: immutable.IndexedSeq[AppErrorType] = findValues

}
