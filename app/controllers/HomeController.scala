package controllers

import javax.inject._

import repositories.AccountRepository
import models.Account
import play.api.mvc._
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._

@Singleton
class HomeController @Inject() (
  val accountDao: AccountRepository
) extends Controller {

  def getAccount(login: String) = Action {
    accountDao.getByLogin(login) match {
      case Some(account) => Ok(Json.toJson(account))
      case None => NotFound(Json.toJson("Not found :(" ))
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
    accountForm.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(formWithErrors.toString) // TODO return human readable errors
      },
      { case (login, password, mail) =>
        val account = Account.initFrom(mail, login, password)

        accountDao.insert(account) match {
          case Left(exception) => BadRequest(s"Error: ${exception.toString}") // TODO return uniform errors
          case _ => Ok(s"Got: $login") // TODO return created account ?
        }
      }
    )
  }

  def index = Action {
    Ok(views.html.index())
  }

}
