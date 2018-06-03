package io.cumulus.services

import io.cumulus.core.{Logging, Settings}
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.User
import io.cumulus.views.email.CumulusEmailTemplate
import play.api.libs.mailer.{Email, SMTPMailer}

import scala.util.Try

/**
  * Mail service.
  */
class MailService(
  mailer: SMTPMailer
)(
  implicit
  settings: Settings
) extends Logging {

  /**
    * Send a mail to an user. Note that the mail's sending is for now blocking.
    * @param subject Subject of the mail.
    * @param emailContent Content of the mail.
    * @param to Recipient user.
    */
  def sendToUser(subject: String, emailContent: CumulusEmailTemplate, to: User): Either[AppError, String] =
    sendTo(subject, emailContent, Seq(s"${to.login} <${to.email}>"))

  /**
    * Send a mail to the specified recipients. Note that the mail's sending is for now blocking.
    * @param subject Subject of the mail.
    * @param emailContent Content of the mail.
    * @param to Recipients.
    */
  def sendTo(subject: String, emailContent: CumulusEmailTemplate, to: Seq[String]): Either[AppError, String] = {

    val email = Email(
      s"Cumulus Cloud - $subject",
      s"<${settings.mail.from}>",
      to,
      bodyHtml = Some(emailContent.content.render)
    )

    // TODO send using an actor
    Try(mailer.send(email)).toEither.left.map(e => AppError.technical(e.getMessage))
  }

}
