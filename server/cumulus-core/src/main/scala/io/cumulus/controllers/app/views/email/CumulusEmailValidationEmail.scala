package io.cumulus.controllers.app.views.email

import io.cumulus.Settings
import io.cumulus.i18n.Messages
import io.cumulus.utils.Base16
import io.cumulus.models.user.User
import scalatags.Text.all._


case class CumulusEmailValidationEmail(
  user: User,
)(implicit
  val settings: Settings,
  val messages: Messages
) extends CumulusEmailTemplate {

  override protected def mailContentTitle: String =
    messages("email.email-validation.content-title")

  override protected def mailContent: Seq[Tag] = {
    val link = s"${settings.host.url}/validateEmail?userLogin=${user.login}&emailCode=${Base16.encode(user.security.validationCode)}"

    Seq(
      span(
        messages("email.email-validation.greetings", user.login),
        br, br,
        messages("email.email-validation.content", user.email),
        a(
          href := link,
          style := "color: #3dc7be;",
          messages("email.email-validation.link")
        ),
        messages("email.email-validation.content-next")
      ),
      span(
        messages("email.email-validation.disclaimer")
      )
    )
  }

}
