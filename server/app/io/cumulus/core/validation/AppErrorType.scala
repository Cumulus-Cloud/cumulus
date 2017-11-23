package io.cumulus.core.validation

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry}
import play.api.mvc.Results

sealed abstract class AppErrorType(val status: Results.Status) extends EnumEntry

/**
  * Type of error, used to know which status to return
  */
object AppErrorType extends Enum[AppErrorType] {

  /** Used when a resource is not found */
  case object NOT_FOUND extends AppErrorType(Results.NotFound)

  /** Used when the user should be logged in */
  case object UNAUTHORIZED extends AppErrorType(Results.Unauthorized)

  /** Used when the user has no sufficient rights */
  case object FORBIDDEN extends AppErrorType(Results.Forbidden)

  /** Used when the information provided are invalid */
  case object VALIDATION extends AppErrorType(Results.BadRequest)

  /** Used for any unexpected error */
  case object TECHNICAL extends AppErrorType(Results.InternalServerError)

  override val values: immutable.IndexedSeq[AppErrorType] = findValues
}
