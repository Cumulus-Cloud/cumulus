package io.cumulus.services

import io.cumulus.core.Logging
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.User
import play.api.libs.mailer.{Email, SMTPMailer}

import scala.concurrent.ExecutionContext
import scala.util.Try

class MailService(
  mailer: SMTPMailer
)(
  implicit
  ec: ExecutionContext
) extends Logging {

  def sendToUser(message: String, user: User) = {

    val email = Email(
      "Email test",
      "Mister FROM <from@email.com>",
      Seq(s"${user.login} <${user.email}>"),
      bodyText = Some("A text message"),
      bodyHtml = Some(s"""<html><body><p>An <b>html</b> message $message</p></body></html>""")
    )

    // TODO send using an actor
    Try(mailer.send(email)).toEither.left.map(e => AppError.technical(e.getMessage))
  }

  def sendToAll(text: String)(implicit user: User) = ???

}
