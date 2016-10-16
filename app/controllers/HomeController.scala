package controllers

import javax.inject._

import repositories.AccountRepository
import models.Account
import play.api.mvc._
import play.api.libs.json._

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

  def createAccount() = Action { request =>
    request.body.asJson.map { json =>

      // TODO Validate JSON
      val login = (json \ "login").as[String]
      val password = (json \ "password").as[String]
      val mail = (json \ "mail").as[String]

      val account = Account(mail, login, password)

      accountDao.insert(account) match {
        case Left(exception) => Ok(s"Error: ${exception.toString}")
        case _ => Ok(s"Got: ${account.login}")
      }
    }.getOrElse {
      BadRequest("Expecting application/json request body :(")
    }
  }

  def index = Action {
    Ok(views.html.index())
  }

}
