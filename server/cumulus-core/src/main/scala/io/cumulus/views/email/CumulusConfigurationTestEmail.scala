package io.cumulus.views.email

import io.cumulus.core.Settings
import play.api.i18n.Messages
import scalatags.Text
import scalatags.Text.all.{br, _}

case class CumulusConfigurationTestEmail(
)(implicit
  val settings: Settings,
  val messages: Messages
) extends CumulusEmailTemplate {

  override protected def mailContentTitle: String =
    "Test Email" // TODO use i18n

  override protected def mailContent: Seq[Text.all.Tag] =
    Seq(
      span(
        "This is a test email, verifying the configuration you provided to Cumulus.", // TODO use i18n
        br, br,
        "..if you're seeing this, it is probably already working \uD83D\uDE80"
      )
    )// TODO use i18n

}
