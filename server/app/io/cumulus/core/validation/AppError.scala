package io.cumulus.core.validation

import scala.language.implicitConversions

import cats.data.NonEmptyList
import play.api.libs.json.JsPath

/**
  * Common trait for every error
  */
sealed trait AppError {
  def errorType: AppErrorType
}

object AppError {

  def notFound(key: String, args: String*): AppError =
    GlobalError(AppErrorType.NOT_FOUND, key, args: _*)

  def unauthorized(key: String, args: String*): AppError =
    GlobalError(AppErrorType.UNAUTHORIZED, key, args: _*)

  def forbidden(key: String, args: String*): AppError =
    GlobalError(AppErrorType.FORBIDDEN, key, args: _*)

  def validation(key: String, args: String*): AppError =
    GlobalError(AppErrorType.VALIDATION, key, args: _*)

  def validation(errors: NonEmptyList[FieldValidationError]): AppError =
    ValidationError(errors)

  def validation(error: FieldValidationError): AppError =
    ValidationError(NonEmptyList.of(error))

  def validation(path: JsPath, key: String, args: String*): AppError =
    validation(FieldValidationError(path, key, args: _*))

  def notAcceptable(key: String, args: String*): AppError =
    GlobalError(AppErrorType.NOT_ACCEPTABLE, key, args: _*)

  def technical(key: String, args: String*): AppError =
    GlobalError(AppErrorType.TECHNICAL, key, args: _*)

  /**
    * Error are almost always used as left. Use this implicit conversion to simply return an error where
    * a Left[Error] is expected
    */
  implicit def errorToLeft[A](error: AppError): Either[AppError, A] = Left(error)

  implicit class EitherToError[A](val result: Either[NonEmptyList[FieldValidationError], A]) extends AnyVal {
    def toValidationError: Either[ValidationError, A] = result.left.map(ValidationError)
  }

}

case class FieldValidationError(path: JsPath, key: String, args: String*)

object FieldValidationError {

  /**
    * Error are almost always used as left. Use this implicit conversion to simply return an error where
    * a Left[Error] is expected
    */
  implicit def fieldErrorToLeft[A](fieldError: FieldValidationError): Either[FieldValidationError, A] =
    Left(fieldError)
}

/**
  * Validation error, composed of multiple errors
  */
case class ValidationError(errors: NonEmptyList[FieldValidationError]) extends AppError {
  val errorType: AppErrorType = AppErrorType.VALIDATION
}

/**
  * Global error
  */
case class GlobalError(errorType: AppErrorType, key: String, args: String*) extends AppError
