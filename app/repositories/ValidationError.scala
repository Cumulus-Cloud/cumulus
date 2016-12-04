package repositories

import play.api.libs.json.{Json, JsValue, Writes}

// Easy to use validation error for the repositories
case class ValidationError(field: String, errors: Seq[String])

object ValidationError {

  def apply(field: String, error: String): ValidationError = ValidationError(field, Seq(error))

  implicit val validationErrorWrites = new Writes[ValidationError] {
    def writes(validationError: ValidationError): JsValue = {
      Json.obj(validationError.field -> validationError.errors)
    }
  }
}
