package controllers

import javax.inject._

import play.api.i18n.MessagesApi
import repositories.{DirectoryRepository, AccountRepository}
import models.{Account, Directory}
import play.api.mvc._
import play.api.libs.json._
import play.api.data._
import play.api.data.Forms._

import utils.EitherUtils._

@Singleton
class HomeController @Inject() (
                                 val accountRepo: AccountRepository,
                                 val directoryRepo: DirectoryRepository,
                                 val messagesApi: MessagesApi
) extends BaseController {

  def bootstrap = Action {
    // Get the admin user. We'll see how to handle this in the future, since
    // at least the root directory should be created by an admin
    val admin = accountRepo.getByLogin("admin").get

    //
    // Create the following directory structure (root is already created) :
    //
    //    "/"
    //   /   \
    // "a"   "b"
    //       /  \
    //     "a1" "b1"
    //     /  \   \
    //   "a2" "b2" "a3"
    val a = Directory.initFrom("/a", admin)
    val b = Directory.initFrom("/b", admin)
    val a1 = Directory.initFrom("/a/a1", admin)
    val b1 = Directory.initFrom("/a/b1", admin)
    val a2 = Directory.initFrom("/a/a1/a2", admin)
    val b2 = Directory.initFrom("/a/a1/b2", admin)
    val a3 = Directory.initFrom("/a/b1/a3", admin)

    // Insert everything...
    (for {
      r <- directoryRepo.insert(a)(admin)
      r <- directoryRepo.insert(b)(admin)
      r <- directoryRepo.insert(a1)(admin)
      r <- directoryRepo.insert(b1)(admin)
      r <- directoryRepo.insert(a2)(admin)
      r <- directoryRepo.insert(b2)(admin)
      r <- directoryRepo.insert(a3)(admin)
    } yield r) match {
      case Right(_) =>
        // Everything is done. Not that this will failed miserably if replayed
        Ok("All done :)")
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }

  }

  def getDirectory(location: String) = Action {
    // TODO use authentication
    val admin = accountRepo.getByLogin("admin").get

    // Clean the location to remove duplicated '/' or trailing '/'
    val cleanedLocation = "/" + location.split("/").filterNot(_.isEmpty).mkString("/")

    directoryRepo.getByPath(cleanedLocation)(admin) match {
      case Right(directoryO) => directoryO match {
        case Some(directory) => Ok(Json.toJson(directory))
        case None => NotFound("Not found :(")  // TODO handle all errors in JSON
      }
      case Left(e) => BadRequest(Json.toJson(e))
    }
  }

  def getAccount(login: String) = Action {
    accountRepo.getByLogin(login) match {
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

        accountRepo.insert(account) match {
          case Left(e) => BadRequest(Json.toJson(e))
          case _ => Ok(Json.toJson(account))
        }
    }
  }

  def index = Action {
    Ok(views.html.index())
  }
}
