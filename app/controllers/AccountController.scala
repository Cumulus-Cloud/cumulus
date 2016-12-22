package controllers

import javax.inject.{Inject, Singleton}

import play.api.data.Form
import play.api.data.Forms.{nonEmptyText, tuple, email => emailForm}
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import utils.{Conf, Log}
import models.Account
import org.mindrot.jbcrypt.BCrypt
import pdi.jwt.JwtJson
import repositories.AccountRepository

@Singleton
class AccountController @Inject() (
 accountRepository: AccountRepository,
 auth: AuthActionService,
 conf: Conf,
 val messagesApi: MessagesApi
) extends Controller with I18nSupport with Log {

  val key = conf.cryptoKey
  val header = Json.obj("typ" -> "JWT", "alg" -> "HS256")

  val signUpForm = Form(tuple(
    "mail" -> emailForm,
    "login" -> nonEmptyText,
    "password" -> nonEmptyText
  ))

  def signUp = Action { implicit request =>
    signUpForm.bindFromRequest.fold(
      formWithErrors => BadRequest(formWithErrors.errorsAsJson),
      { case (mail, login, password) =>
        accountRepository.insert(Account.initFrom(mail, login, password)) match {
          case Right(account) =>
            val claim = Json.obj("user_id" -> account.id)
            val token = JwtJson.encode(header, claim, key)
            logger.debug(s"signUp account=$account token=$token ")
            Ok(Json.obj(
              "account" -> Json.toJson(account),
              "token" -> token
            ))
          case Left(e) =>
            logger.debug(s"signUp err $e")
            BadRequest(Json.toJson(e))
        }
      }
    )
  }

  val loginForm = Form(tuple(
    "mail" -> emailForm,
    "password" -> nonEmptyText
  ))

  def login = Action { implicit request =>
    loginForm.bindFromRequest.fold(
      formWithErrors => BadRequest(formWithErrors.errorsAsJson),
      { case (mail, password) =>
        accountRepository.getByMail(mail) match {
          case Some(account) if BCrypt.checkpw(password, account.password) =>
            val claim = Json.obj("user_id" -> account.id)
            val token = JwtJson.encode(header, claim, key)
            logger.debug(s"login claim=$claim token=$token account=$account")
            Ok(Json.obj(
              "account" -> Json.toJson(account),
              "token" -> token
            ))
          case _ =>
            logger.debug("login incorrect mail or password")
            NotFound(Json.obj(
              "login" -> Seq("Incorrect mail or password")
            ))
        }
      }
    )
  }

  def me = auth.AuthAction { implicit request =>
    Ok(Json.toJson(request.accound))
  }
}
