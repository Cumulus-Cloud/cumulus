package io.cumulus.services

import io.cumulus.core.{Logging, Settings}
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.User
import io.cumulus.views.email.CumulusEmail
import play.api.libs.mailer.{Email, SMTPMailer}

import scala.util.Try

class MailService(
  mailer: SMTPMailer
)(
  implicit
  settings: Settings
) extends Logging {

  def sendToUser(subject: String, emailContent: CumulusEmail, to: User): Either[AppError, String] = {

    val email = Email(
      s"Cumulus Cloud - $subject",
      s"<${settings.mail.from}>",
      Seq(s"${to.login} <${to.email}>"),
      bodyHtml = Some(emailContent.content.render)
    )

    // TODO send using an actor
    Try(mailer.send(email)).toEither.left.map(e => AppError.technical(e.getMessage))
  }

  def sendToAll(text: String)(implicit user: User) = ???

}
