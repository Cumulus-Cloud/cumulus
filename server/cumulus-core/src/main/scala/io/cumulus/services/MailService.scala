package io.cumulus.services

import io.cumulus.Settings
import io.cumulus.validation.AppError
import io.cumulus.models.user.User
import io.cumulus.utils.Logging
import io.cumulus.views.email.CumulusEmailTemplate
import courier._
import javax.mail.internet.InternetAddress

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

/**
  * Mail service.
  */
class MailService(
  mailer: Mailer
)(
  implicit
  ec: ExecutionContext,
  settings: Settings
) extends Logging {


  /**
    * Send a mail to an user. Note that the mail's sending is for now blocking.
    * @param subject Subject of the mail.
    * @param emailContent Content of the mail.
    * @param to Recipient user.
    */
  def sendToUser(subject: String, emailContent: CumulusEmailTemplate, to: User): Future[Either[AppError, Unit]] = {
    val mail =
      Envelope
        .from(new InternetAddress(settings.mail.from, settings.mail.personal))
        .to(new InternetAddress(to.email, to.login))
        .subject(s"Cumulus Cloud - $subject")
        .content(Multipart().html(emailContent.content.render))

    // TODO send using an actor to handle retry
    mailer(mail)
      .map(Right(_))
      .recover {
        case NonFatal(e) =>
          Left(AppError.technical(e.getMessage))
      }
  }

}
