package io.cumulus.controllers

import io.cumulus.validation.AppError
import play.api.http.ContentTypes
import play.api.i18n.Messages
import play.api.mvc.{RequestHeader, Result, Results}

trait TextSerializationSupport
  extends SerializationSupport
    with ErrorSupport {

  val contentType: String = ContentTypes.TEXT

  /** Defines a serialization for errors. */
  protected def errorResulting: Resulting[AppError] =
    new Resulting[AppError] {

      def toResult(error: AppError)(implicit req: RequestHeader): Result = {
        Results.Status(error.errorType.status)(Messages(error.key, error.args))
      }

    }

}
