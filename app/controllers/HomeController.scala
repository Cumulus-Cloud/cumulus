package controllers

import java.io._
import javax.inject._

import akka.actor.ActorSystem
import akka.stream._
import akka.stream.scaladsl.Source
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.util.ByteString
import models.{Directory, File}
import play.api.i18n.MessagesApi
import play.api.libs.json._
import play.api.libs.streams.Accumulator
import play.api.mvc._
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}

import utils.EitherUtils._
import utils.FileSplitter

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

  // TEST 2
  class FileSplitter(val chunkSize: Int) extends GraphStage[FlowShape[ByteString, java.io.File]] {
    val in = Inlet[ByteString]("Chunker.in")
    val out = Outlet[java.io.File]("Chunker.out")
    override val shape = FlowShape.of(in, out)

    override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
      // The sequence of files created
      private var files: Seq[java.io.File] = Seq()
      // The current file
      private var file = new java.io.File(randomFilename())
      // The current file output stream
      private var fileWriter = new BufferedOutputStream(new FileOutputStream(file))
      // Number of bytes written
      private var written: Int = 0

      setHandler(out, new OutHandler {
        override def onPull(): Unit = {
          if (isClosed(in)) emitFile()
          else pull(in)
        }
      })

      setHandler(in, new InHandler {
        override def onPush(): Unit = {
          val elem = grab(in)

          write(elem)

          emitFile()
        }

        override def onUpstreamFinish(): Unit = {
          // Close the writer and add to the ready list
          fileWriter.close()
          files = files :+ file

          if (files.isEmpty)
            completeStage()
          else if (isAvailable(out))
            emitFile()
        }
      })

      private def write(bytes: ByteString): Unit = {
        // If the new chunk + the written chunks exceeds the maximum file size
        if(written + bytes.length > chunkSize) {
          // Slice into 2 ByteString
          val bytesCurrent = bytes.slice(0, chunkSize - written)
          val bytesNext = bytes.slice(bytesCurrent.length, bytes.size)

          // Write to the current file
          fileWriter.write(bytesCurrent.toArray)
          fileWriter.close()
          files = files :+ file // Add to the ready list

          // Create a new file and update the state
          file = new java.io.File(randomFilename()) // Random name
          fileWriter = new BufferedOutputStream(new FileOutputStream(file))
          written = 0

          write(bytesNext)
        } else {
          // File not full, write
          fileWriter.write(bytes.toArray)
          written += bytes.length
        }
      }

      private def emitFile(): Unit = {
        if (files.isEmpty) {
          if (isClosed(in))
            completeStage()
          else
            pull(in)
        } else {
          val file = files.head
          files = files.tail
          push(out, file)
        }
      }

      private def randomFilename(): String = {
        "tmp/" + java.util.UUID.randomUUID.toString
      }

    }
  }

  // Custom parser to set the body as a source
  val customParser: BodyParser[Source[ByteString, _]] = BodyParser { req =>
    Accumulator.source[ByteString].map(Right.apply)
  }

  def testUpload(filename: String) = Action.async(customParser) { request =>
    println("Upload start!")
    val t0 = System.nanoTime()

    // 100 Mo
    request.body.via(FileSplitter(104857600)).runForeach(files => {
      //println(files)
    }).map(_ => {
      val t1 = System.nanoTime()
      println("Elapsed time: " + (t1 - t0)/1000000 + "ms")

      println("Upload done!")
      Ok("uploaded")
    })
  }

  def getDirectory(location: String) = auth.AuthAction { implicit request =>
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
