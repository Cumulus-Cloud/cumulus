package io.cumulus.views.email

import io.cumulus.core.Settings
import io.cumulus.core.utils.Base16
import io.cumulus.models.user.User
import scalatags.Text.all._


case class CumulusEmailValidationEmail(
  user: User,
)(implicit
  val settings: Settings
) extends CumulusEmailTemplate {

  override protected def mailContentTitle: String =
    "Email Validation"

  override protected def mailContent: Seq[Tag] = {
    val link = s"${settings.host.url}/validateEmail?userLogin=${user.login}&emailCode=${Base16.encode(user.security.emailCode)}"

    Seq(
      span(
        s"Hello ${user.login}!",
        br, br,
        s"To validate your email ${user.email}, please follow ",
        a(
          href := link,
          style := "color: #3dc7be;",
          "this link"
        )
      ), // TODO internationalization
      span(
        "This is an automatic email. For any question, feel free to get back to your local Cumulus administrator."
      ) // TODO internationalization
    )
  }

}
