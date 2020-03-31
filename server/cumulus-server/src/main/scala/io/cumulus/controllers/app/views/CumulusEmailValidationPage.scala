package io.cumulus.controllers.app.views

import io.cumulus.Settings
import io.cumulus.validation.{AppError, GlobalError}
import io.cumulus.models.user.User
import io.cumulus.views.CumulusStaticTemplate
import play.api.i18n.Messages
import scalatags.Text
import scalatags.Text.all._


/**
  * Email validation page. This static page will be generated after the email has been validated. Id the email is
  * successfully validated, then a congratulation message will be displayed, otherwise the error message will be shown.
  */
case class CumulusEmailValidationPage(
  result: Either[AppError, User]
)(implicit
  val messages: Messages,
  settings: Settings
) extends CumulusStaticTemplate {

  override protected def pageContent: Seq[Text.all.Tag] = {
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
            a(href := settings.host.url, messages("view.email-validation.success-content-link"))
          )
        )
    }
  }

  override protected def pageRightPanel: Seq[Text.all.Tag] =
    Seq.empty

}
