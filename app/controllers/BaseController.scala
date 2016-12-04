package controllers

import javax.inject.Inject

import play.api.data.Form
import play.api.i18n.I18nSupport
import play.api.mvc.{Result, Controller}

abstract class BaseController @Inject() extends Controller with I18nSupport {

  // Execute the handle with the parsed body, or handles the error
  def getPayload[A](form: Form[A])(handle: A => Result)(implicit request: play.api.mvc.Request[_]): Result = {
    form.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(formWithErrors.errorsAsJson)
      }, handle
    )
  }

}
