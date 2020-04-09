package io.cumulus.views.pages

import io.cumulus.Settings
import io.cumulus.i18n.{Lang, Messages}
import io.cumulus.models.user.User
import io.cumulus.validation.{AppError, GlobalError}
import scalatags.Text.all._


/**
  * Email validation page. This static page will be generated after the email has been validated. Id the email is
  * successfully validated, then a congratulation message will be displayed, otherwise the error message will be shown.
  */
case class EmailValidationPage(
  result: Either[AppError, User]
)(implicit
  val messages: Messages,
  val settings: Settings
) extends CumulusTemplate {

  override protected def pageBody(implicit l: Lang): Seq[Tag] = {
    result match {
      case Left(error: GlobalError) =>
        Seq(
          h1(messages("view.email-validation.error-with-message-title")),
          p(messages("view.email-validation.error-with-message-content", messages(error.key)))
        )
      case Left(_) =>
        Seq(
          h1(messages("view.email-validation.error-without-message-title")),
          p(messages("view.email-validation.error-without-message-content"))
        )
      case Right(user) =>
        Seq(
          h1(messages("view.email-validation.success-title")),
          p(
            messages("view.email-validation.success-content", user.login),
            br, br,
            messages("view.email-validation.success-content-next"),
            a(href := settings.http.url, messages("view.email-validation.success-content-link"))
          )
        )
    }
  }

}
