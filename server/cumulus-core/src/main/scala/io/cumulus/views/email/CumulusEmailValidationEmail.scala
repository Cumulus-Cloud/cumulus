package io.cumulus.views.email

import io.cumulus.core.Settings
import io.cumulus.core.utils.Base16
import io.cumulus.models.user.User
import play.api.i18n.Messages
import scalatags.Text.all._

/**
  * Validation email, used to check the email used by an user using a send link.
  */
case class CumulusEmailValidationEmail(
  user: User,
)(implicit
  val settings: Settings,
  val messages: Messages
) extends CumulusEmailTemplate {

  def mailContentTitle: String =
    messages("email.email-validation.content-title")

  def mailContent: Seq[Tag] = {
    val link = s"${settings.host.url}/validateEmail?userLogin=${user.login}&emailCode=${Base16.encode(user.security.emailCode)}"

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
