package io.cumulus.controllers.bodyParsers

import io.cumulus.controllers.ErrorSupport
import io.cumulus.validation.AppError
import play.api.libs.json._
import play.api.mvc._


/**
  * Trait to provided an easy to use JSON parser for a specified payload type.
  */
trait BodyParserJson extends ErrorSupport { self: BaseController =>

  def parseJson[A](implicit reader: Reads[A]): BodyParser[A] =
    BodyParser("JSON reader") { implicit request =>
      self.parse.json
        .apply(request)
        .map {
          case Left(_) =>
            Left(AppError.validation("api-error.bad-format").toResult)
          case Right(jsValue) =>
            jsValue.validate(reader) map { a =>
              Right(a)
            } recoverTotal { jsError =>
              Left(AppError.validation(jsError).toResult)
            }
        }(self.defaultExecutionContext)
    }

}
