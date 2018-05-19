package io.cumulus.core.controllers.utils.api

import play.api.i18n.Messages
import play.api.libs.json._
import play.api.mvc._

case class ApiError(
  status: Results.Status,
  key: String,
  jsError: JsError,
  args: Seq[Any] = Seq.empty
)(
  implicit messages: Messages
) {

  private def pathDotted(jsPath: JsPath): String = jsPath.toString() match {
    case path if path.nonEmpty => path.tail.replace("/", ".").replace("(", ".").replace(")", "")
    case _                     => ""
  }

  private def jsonError(): JsObject = {
    val nonEmptyErrors =
      jsError.errors
        .map {
          case (path, errs) =>
            (
              path,
              errs
                .map(e => JsonValidationError(e.messages.filterNot(_ == "error.sealed.trait"), e.args: _*))
                .filter(_.messages.nonEmpty)
            )
        }
        .filter { case (_, errs) => errs.nonEmpty }
    val errors =
      nonEmptyErrors.foldLeft(Json.obj()) {
        case (acc, (jsPath, seqValidationErrors)) =>
          acc + (pathDotted(jsPath) -> JsArray(
            seqValidationErrors.flatMap { err =>
              err.messages.map(
                key => {
                  Json.obj(
                    "key"     -> key,
                    "message" -> Messages(key, err.args: _*),
                    "args"    -> Json.toJson(err.args)(ApiError.argsWrites)
                  )
                }
              )
            }
          ))
      }

    Json.obj(
      "key"     -> key,
      "message" -> Messages(key, args: _*),
      "errors"  -> errors,
      "args"    -> Json.toJson(args)(ApiError.argsWrites)
    )
  }

  def toResult: Result = status(jsonError())
}

object ApiError {
  def apply(status: Results.Status, key: String)(implicit messages: Messages) =
    new ApiError(status, key, JsError())

  def apply(status: Results.Status, key: String, args: Any*)(implicit messages: Messages) =
    new ApiError(status, key, JsError(), args)

  private val anyWrites = Writes[Any] {
    case s: String                    => JsString(s)
    case nb: Int                      => JsNumber(BigDecimal(nb))
    case nb: Short                    => JsNumber(BigDecimal(nb))
    case nb: Long                     => JsNumber(BigDecimal(nb))
    case nb: Double                   => JsNumber(BigDecimal(nb))
    case nb: Float                    => JsNumber(BigDecimal(nb.toDouble))
    case b: Boolean                   => JsBoolean(b)
    case js: JsValue                  => js
    case (key: String, value: String) => Json.obj(key -> value)
    case other                        => JsString(other.toString)
  }
  private val argsWrites = Writes.traversableWrites[Any](anyWrites)
}
