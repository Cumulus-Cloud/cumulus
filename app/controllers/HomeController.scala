package controllers

import javax.inject._

import play.api.i18n.MessagesApi
import repositories.AccountRepository
import models.Account
import play.api.mvc._
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._

@Singleton
class HomeController @Inject() (
  val accountDao: AccountRepository,
  val messagesApi: MessagesApi
) extends BaseController {

  def getAccount(login: String) = Action {
    accountDao.getByLogin(login) match {
      case Some(account) => Ok(Json.toJson(account))
      case None => NotFound(Json.toJson("Not found :(" )) // TODO handle all errors in JSON
    }
  }

  val accountForm = Form(
    tuple(
      "login" -> text(minLength = 4, maxLength = 64),
      "password" -> text(minLength = 6),
      "mail" -> email
    )
  )

  def createAccount() = Action { implicit request =>
    getPayload(accountForm) {
      case (login, password, mail) =>
        val account = Account.initFrom(mail, login, password)

        accountDao.insert(account) match {
          case Left(e) => BadRequest(Json.toJson(e))
          case _ => Ok(Json.toJson(account))
        }
    }
  }

  def index = Action {
    Ok(views.html.index())
  }

}
