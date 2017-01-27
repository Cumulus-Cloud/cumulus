package controllers

import javax.inject._

import akka.actor.ActorSystem
import akka.stream._
import akka.stream.scaladsl.Source
import akka.util.ByteString
import models.{Directory, File}
import play.api.Configuration
import play.api.i18n.MessagesApi
import play.api.libs.json._
import play.api.libs.streams.Accumulator
import play.api.mvc._
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils.EitherUtils._

/**
  * Test zone do not touch/use :)
  */
@Singleton
class HomeController @Inject() (
                                 val accountRepo: AccountRepository,
                                 val directoryRepo: DirectoryRepository,
                                 val fileRepo: FileRepository,
                                 val auth: AuthenticationActionService,
                                 val messagesApi: MessagesApi,
                                 val configuration: Configuration
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

  val storageEngine = LocalStorageEngine(configuration)

  // Custom parser to set the body as a source
  val customParser: BodyParser[Source[ByteString, _]] = BodyParser { req =>
    Accumulator.source[ByteString].map(Right.apply)
  }
/*
  def testUpload(filename: String) = Action.async(customParser) { request =>
    Logger.debug("Upload started!")
    val t0 = System.nanoTime()

    // 100 Mo = 104857600 o
    request.body.via(FileUploader(storageEngine, 104857600)).fold(Seq.empty[FileSources])((chunks, chunk) => {
      Logger.debug(s"Chunk created => $chunk")
      chunks :+ chunk
    }).runForeach(chunks => {
      println(chunks)
      // TODO upload chunks here
    }).map(_ => {
      val t1 = System.nanoTime()
      Logger.debug("Elapsed time: " + (t1 - t0)/1000000 + "ms")

      Logger.debug("Upload done!")
      Ok("uploaded")
    })
  }*/

  /*
  def testDownload = Action { request =>
    val chunks = Seq(
      /*
      FileChunk(UUID.fromString("132751bf-c1fb-406e-9930-6dbe7cd6de2e"), 18, "", "", DateTime.now()),
      FileChunk(UUID.fromString("9da6e51f-d8c4-41d9-817c-70949f21997d"), 18, "", "", DateTime.now()),
      FileChunk(UUID.fromString("d05c8f6c-14a4-4713-bf8d-b93ac4635809"), 18, "", "", DateTime.now()),
      FileChunk(UUID.fromString("f510c900-f892-4377-ba20-f32aac20fc30"), 18, "", "", DateTime.now()),
      FileChunk(UUID.fromString("5df4ce07-a248-49e6-b341-397af3b5d3ec"), 18, "", "", DateTime.now())*/
    )

    //val fileStream = Source[FileSources](chunks.to[collection.immutable.Seq]).via(FileDownloader(storageEngine, 9))

    Ok.chunked(fileStream)//.withHeaders(("Content-Type", "image/jpg"))
  }*/

  def getDirectory(location: String) = auth.AuthenticatedAction { implicit request =>
    val admin = request.account

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
