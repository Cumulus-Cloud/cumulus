package io.cumulus.core.controllers.utils.api

import io.cumulus.core.json.JsonFormat
import play.api.i18n.Messages
import play.api.libs.json.JsError
import play.api.mvc.Results.{BadRequest, EntityTooLarge, Forbidden, InternalServerError, NotFound, Unauthorized}

object ApiErrors {

  private val keyRoot = "api-error"

  def badRequest(arg: String)(implicit messages: Messages) =
    ApiError(BadRequest, key = s"$keyRoot.bad-request", arg)

  def invalidFormat(implicit messages: Messages) =
    ApiError(BadRequest, key = s"$keyRoot.bad-format")

  def invalidFormatFormData(implicit messages: Messages) =
    ApiError(BadRequest, key = s"$keyRoot.bad-format-form-data")

  def forbidden(arg: String)(implicit messages: Messages) =
    ApiError(Forbidden, key = s"$keyRoot.forbidden", arg)

  def unauthorized(arg: String)(implicit messages: Messages) =
    ApiError(Unauthorized, key = s"$keyRoot.forbidden", arg)

  def payloadTooLarge(maxSize: Long)(implicit messages: Messages) =
    ApiError(EntityTooLarge, key = s"$keyRoot.entity-too-large", JsonFormat.humanReadable(maxSize))

  def notFound(implicit messages: Messages) =
    ApiError(NotFound, key = s"$keyRoot.not-found")

  def routeNotFound(method: String, path: String)(implicit messages: Messages) =
    ApiError(NotFound, key = s"$keyRoot.route-not-found", method, path)

  def validationError(errors: JsError)(implicit messages: Messages) =
    ApiError(BadRequest, key = s"$keyRoot.validation-errors", errors)

  def internalServerError(implicit messages: Messages) =
    ApiError(InternalServerError, key = s"$keyRoot.internal-server-error")

}
