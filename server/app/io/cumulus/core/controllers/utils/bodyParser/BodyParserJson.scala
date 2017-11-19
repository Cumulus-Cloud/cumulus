package io.cumulus.core.controllers.utils.bodyParser

import io.cumulus.core.controllers.utils.api.ApiErrors
import play.api.i18n.I18nSupport
import play.api.libs.json._
import play.api.mvc._

trait BodyParserJson extends I18nSupport { self: BaseController =>

  def parseJson[A](implicit reader: Reads[A]): BodyParser[A] =
    BodyParser("JSON reader") { implicit request =>
      self.parse.json
        .apply(request)
        .map {
          case Left(_) => Left(ApiErrors.invalidFormat.toResult)
          case Right(jsValue) =>
            jsValue.validate(reader) map { a =>
              Right(a)
            } recoverTotal { jsError =>
              Left(ApiErrors.validationError(jsError).toResult)
            }
        }(self.defaultExecutionContext)
    }

}
