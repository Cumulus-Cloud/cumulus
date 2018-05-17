package io.cumulus.services

import io.cumulus.core.{Logging, Settings}
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.User
import play.api.libs.mailer.{Email, SMTPMailer}

import scala.concurrent.ExecutionContext
import scala.util.Try

class MailService(
  mailer: SMTPMailer
)(
  implicit
  settings: Settings,
  ec: ExecutionContext
) extends Logging {

  def sendToUser(subject: String, message: String, user: User): Either[AppError, String] = {

    val email = Email(
      s"Cumulus Cloud - $subject",
      s"<${settings.mail.from}>",
      Seq(s"${user.login} <${user.email}>"),
      // TODO use a template
      bodyHtml = Some(s"""<html><body><p>An <b>html</b> message $message</p></body></html>""")
    )

    // TODO send using an actor
    Try(mailer.send(email)).toEither.left.map(e => AppError.technical(e.getMessage))
  }

  def sendToAll(text: String)(implicit user: User) = ???

}
