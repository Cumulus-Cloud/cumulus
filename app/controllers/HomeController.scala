package controllers

import javax.inject._

import models.Directory
import play.api.i18n.MessagesApi
import repositories.filesystem.{DirectoryRepository, FileRepository}
import play.api.libs.json._
import play.api.mvc._
import repositories.AccountRepository
import models.{Account, Directory, File}
import repositories.filesystem.DirectoryRepository
import utils.EitherUtils._

@Singleton
class HomeController @Inject() (
  val accountRepo: AccountRepository,
  val directoryRepo: DirectoryRepository,
  val fileRepo: FileRepository,
  val auth: AuthActionService,
  val messagesApi: MessagesApi
) extends BaseController {

  // Test :)
  def bootstrap = Action {
    // Get the admin user. We'll see how to handle this in the future, since
    // at least the root directory should be created by an admin
    val admin = accountRepo.getByLogin("admin").get

    //
    // Create the following directory structure (root is already created) :
    //
    //    "/"
    //   /   \
    // "b"   "a"__________
    //       /  \    \    \
    //     "a1" "b1" "f1" "f2"
    //     /  \   \
    //   "a2" "b2" "a3"
    val a = Directory.initFrom("/a", admin)
    val b = Directory.initFrom("/b", admin)
    val f1 = File.initFrom("/a/f1", admin)
    val f2 = File.initFrom("/a/f2", admin)
    val a1 = Directory.initFrom("/a/a1", admin)
    val b1 = Directory.initFrom("/a/b1", admin)
    val a2 = Directory.initFrom("/a/a1/a2", admin)
    val b2 = Directory.initFrom("/a/a1/b2", admin)
    val a3 = Directory.initFrom("/a/b1/a3", admin)

    // Insert everything...
    (for {
      r <- directoryRepo.insert(a)(admin)
      r <- directoryRepo.insert(b)(admin)
      r <- fileRepo.insert(f1)(admin)
      r <- fileRepo.insert(f2)(admin)
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

  def getDirectory(location: String) = auth.AuthAction { implicit request =>
    val admin = request.accound

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

  def index = Action {
    Ok(views.html.index())
  }
}
