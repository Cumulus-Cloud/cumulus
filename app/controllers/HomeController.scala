package controllers

import javax.inject._

import akka.NotUsed
import akka.actor.ActorSystem
import akka.stream.scaladsl.{Sink, Source}
import akka.util.ByteString
import models.Directory
import play.api.i18n.MessagesApi
import repositories.filesystem.{DirectoryRepository, FileRepository}
import play.api.libs.json._
import play.api.mvc._
import repositories.AccountRepository
import models.{Account, Directory, File}
import play.api.libs.iteratee.{Enumeratee, Iteratee, Traversable}
import play.api.libs.streams.{Accumulator, Streams}
import repositories.filesystem.DirectoryRepository
import utils.EitherUtils._
import akka.stream._
import akka.stream.scaladsl._

import scala.concurrent.Future

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

  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // Custom parser to set the body as a source
  val customParser: BodyParser[Source[ByteString, _]] = BodyParser { req =>
    Accumulator.source[ByteString].map(Right.apply)
  }

  def testUpload(filename: String) = Action.async(customParser) { request =>
    // Create the file
    val file = new java.io.File(s"tmp/$filename")
    file.getParentFile.mkdirs()

    // Sink where to write the file
    val fileSink = FileIO.toPath(file.toPath)

    // Pass the body to the file sink
    request.body.runWith(fileSink).map(ioresult =>
      Ok("uploaded")
    )
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
