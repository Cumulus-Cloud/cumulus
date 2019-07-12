package io.cumulus.core.controllers.utils.api2

import akka.util.ByteString
import io.cumulus.core.validation.{AppError, GlobalError, ValidationError}
import play.api.http.{ContentTypes, Writeable}
import play.api.i18n.Messages
import play.api.libs.json.{JsPath, Json, Writes}
import play.api.mvc.{Request, RequestHeader, Result, Results}


/** Json serialization support. */
trait JsonSerializationSupport
  extends SerializationSupport
    with ErrorSupport {

  val contentType: String = ContentTypes.JSON

  /** Creates a writable of A if a Writes and a request are in the scope. Allow to return writable types in an action. */
  private def jsonWritable[A](writes: Writes[A], req: RequestHeader): Writeable[A] =
    Writeable[A](
      transform = (a: A) => ByteString(writes.writes(a).toString),
      contentType = Some(contentType)
    )

  /** Helper to convert a js path to a dotted path, for error rendering. */
  private def pathDotted(jsPath: JsPath): String = jsPath.toString() match {
    case path if path.nonEmpty => path.tail.replace("/", ".").replace("(", ".").replace(")", "")
    case _                     => ""
  }

  /** Defines a serialization for errors. */
  protected def errorResulting: Resulting[AppError] =
    new Resulting[AppError] {

      def toResult(error: AppError)(implicit req: Request[_]): Result = {
        error match {
          case globalError: GlobalError =>
            // Directly render to JSON
            Results.Status(globalError.errorType.status)(
              Json.obj(
                "key"     -> globalError.key,
                "message" -> Messages(globalError.key, globalError.args: _*),
                "args"    -> Json.toJson(globalError.args)
              )
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
                        "message" -> Messages(fieldValidationError.key, fieldValidationError.args: _*),
                        "args"    -> Json.toJson(fieldValidationError.args)
                      )
                  }

              }

            // And then render to JSON
            Results.Status(validationError.errorType.status)(
              Json.obj(
                "key"     -> validationError.key,
                "message" -> Messages(validationError.key, validationError.args: _*),
                "args"    -> Json.toJson(validationError.args),
                "errors"  -> errors
              )
            )
        }
      }

    }

  /** JSON serialization. */
  implicit def ResultingJson[A](implicit writer: Writes[A]): Resulting[A] =
    new Resulting[A] {

      def toResult(value: A)(implicit req: Request[_]): Result =
        Results.Ok(value)(jsonWritable[A](writer, req))

    }

}
