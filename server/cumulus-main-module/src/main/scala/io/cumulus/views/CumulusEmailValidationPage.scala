package io.cumulus.views

import io.cumulus.core.Settings
import io.cumulus.core.validation.{AppError, GlobalError}
import io.cumulus.models.user.User
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
  messages: Messages,
  settings: Settings
) extends CumulusStaticTemplate {

  override protected def pageContent: Seq[Text.all.Tag] = {
    result match {
      case Left(error: GlobalError) =>
        Seq(
          h1("Oups! Something went wrong... \uD83D\uDE1E"), // TODO internationalization
          p("The validation did not work: ", messages(error.key)) // TODO internationalization
        )
      case Left(_) =>
        Seq(
          h1("Oups! Something went terribly wrong... \uD83D\uDE1E"), // TODO internationalization
          p("The validation did not work...") // TODO internationalization
        )
      case Right(user) =>
        Seq(
          h1("Congratulations! \uD83C\uDF89"),
          p(
            s"Congratulation ${user.login}!, your email is now validated.", // TODO internationalization
            br, br,
            "You can now use your account with the ", // TODO internationalization
            a(href := settings.host.url, "Cumulus App") // TODO internationalization
          )
        )
    }
  }

  override protected def pageRightPanel: Seq[Text.all.Tag] = {
    result match {
      case Left(_) =>
        Seq(
          input(id := "resend", disabled := "disabled", `type` := "button", `class` := "button", value := "Resend the verification mail"),
          input(id := "change-mail", disabled := "disabled", `type` := "button", `class` := "button", value := "Change the email address"),
        ) // TODO internationalization
      case Right(_) =>
        Seq.empty
    }
  }

}
