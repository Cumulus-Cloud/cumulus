package io.cumulus.validation

import scala.language.implicitConversions
import cats.data.NonEmptyList
import io.cumulus.i18n.{Lang, Messages}
import play.api.libs.json._

import scala.util.Random


/**
  * Common trait for every application error.
  */
sealed trait AppError {

  /** Error pseudo unique ID. */
  val id: String = Random.alphanumeric.take(10).mkString

  /** Type of the error. */
  def errorType: AppErrorType

  /** Key of the error. */
  def key: String

  /** Args */
  def args: Seq[String]

  /** Optional root cause of the error. */
  val cause: Option[Throwable] = None

}

object AppError {

  private val keyRoot = "api-error"

  def notFound: AppError =
    GlobalError(None, AppErrorType.NotFound, s"$keyRoot.bad-request")

  def notFound(key: String, args: String*): AppError =
    GlobalError(None, AppErrorType.NotFound, key, args: _*)

  def unauthorized: AppError =
    GlobalError(None, AppErrorType.Unauthorized, s"$keyRoot.forbidden")

  def unauthorized(key: String, args: String*): AppError =
    GlobalError(None, AppErrorType.Unauthorized, key, args: _*)

  def forbidden: AppError =
    GlobalError(None, AppErrorType.Forbidden, s"$keyRoot.forbidden")

  def forbidden(key: String, args: String*): AppError =
    GlobalError(None, AppErrorType.Forbidden, key, args: _*)

  def validation(key: String, args: String*): AppError =
    GlobalError(None, AppErrorType.Validation, key, args: _*)

  def validation(jsError: JsError): AppError = {
    val errors = jsError.errors.flatMap(e => e._2.map(nestedError => FieldValidationError(e._1, nestedError.message, nestedError.args.map(_.toString):_*)))
    ValidationError(NonEmptyList.fromListUnsafe(errors.toList)) // Thanks play json
  }

  def validation(errors: NonEmptyList[FieldValidationError]): AppError =
    ValidationError(errors)

  def validation(error: FieldValidationError): AppError =
    ValidationError(NonEmptyList.of(error))

  def validation(path: JsPath, key: String, args: String*): AppError =
    validation(FieldValidationError(path, key, args: _*))

  def notAcceptable(key: String, args: String*): AppError =
    GlobalError(None, AppErrorType.NotAcceptable, key, args: _*)

  def technical: AppError =
    GlobalError(None, AppErrorType.Technical, "api-error.internal-server-error")

  def technical(key: String, args: String*): AppError =
    GlobalError(None, AppErrorType.Technical, key, args: _*)

  def technical(throwable: Throwable, key: String, args: String*): AppError =
    GlobalError(Some(throwable), AppErrorType.Technical, key, args: _*)

  def technical(throwable: Throwable): AppError =
    GlobalError(Some(throwable), AppErrorType.Technical, "api-error.internal-server-error")

  /**
    * Error are almost always used as left. Use this implicit conversion to simply return an error where
    * a Left[Error] is expected.
    */
  implicit def errorToLeft[A](error: AppError): Either[AppError, A] = Left(error)

  implicit class EitherToError[A](val result: Either[NonEmptyList[FieldValidationError], A]) extends AnyVal {
    def toValidationError: Either[ValidationError, A] = result.left.map(ValidationError)
  }

  implicit def writes(m: Messages)(implicit l: Lang): Writes[AppError] = new Writes[AppError] {

    override def writes(error: AppError): JsValue = {

      error match {
        case globalError: GlobalError =>
          // Directly render to JSON
          Json.obj(
            "key"     -> globalError.key,
            "message" -> m(globalError.key, globalError.args: _*),
            "args"    -> Json.toJson(globalError.args)
          )

        case validationError: ValidationError =>
          // Accumulate all validation errors
          val errors =
            validationError.errors.foldLeft(Json.obj()) {
              case (obj, fieldValidationError) =>
                obj + {
                  pathDotted(fieldValidationError.path) ->
                    Json.obj(
                      "key"     -> fieldValidationError.key,
                      "message" -> m(fieldValidationError.key, fieldValidationError.args: _*),
                      "args"    -> Json.toJson(fieldValidationError.args)
                    )
                }

            }

          // And then render to JSON
          Json.obj(
            "key"     -> validationError.key,
            "message" -> m(validationError.key, validationError.args: _*),
            "args"    -> Json.toJson(validationError.args),
            "errors"  -> errors
          )
      }
    }

    /** Helper to convert a js path to a dotted path, for error rendering. */
    private def pathDotted(jsPath: JsPath): String = jsPath.toString() match {
      case path if path.nonEmpty => path.tail.replace("/", ".").replace("(", ".").replace(")", "")
      case _                     => ""
    }

  }

}

case class FieldValidationError(path: JsPath, key: String, args: String*)

object FieldValidationError {

  /**
    * Error are almost always used as left. Use this implicit conversion to simply return an error where
    * a Left[Error] is expected.
    */
  implicit def fieldErrorToLeft[A](fieldError: FieldValidationError): Either[FieldValidationError, A] =
    Left(fieldError)
}

/**
  * Validation error, composed of multiple errors.
  */
case class ValidationError(errors: NonEmptyList[FieldValidationError]) extends AppError {

  // Always validation error
  val errorType: AppErrorType = AppErrorType.Validation

  // Always the same key for validation errors
  val key: String = "api-error.validation-errors"

  // No args
  val args: Seq[String] = Seq.empty

}

/**
  * Global error.
  */
case class GlobalError(override val cause: Option[Throwable], errorType: AppErrorType, key: String, args: String*) extends AppError
