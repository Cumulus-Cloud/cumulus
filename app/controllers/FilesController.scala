package controllers

import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source, Compression}
import akka.util.ByteString
import models.{FileChunk, File, Path}
import play.api.{Configuration, Logger}
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.libs.streams.Accumulator
import play.api.mvc.BodyParser
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils.{FileJoiner, FileSplitter}


@Singleton
class FilesController @Inject() (
  val accountRepo: AccountRepository,
  val directoryRepo: DirectoryRepository,
  val fileRepo: FileRepository,
  val auth: AuthActionService,
  val messagesApi: MessagesApi,
  val conf: Configuration
) extends BaseController {

  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // TODO inject
  val storageEngine = LocalStorageEngine(conf)

  // Custom parser to set the body as a source
  val customParser: BodyParser[Source[ByteString, _]] = BodyParser { req =>
    Accumulator.source[ByteString].map(Right.apply)
  }

  def download(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    fileRepo.getByPath(cleanedPath)(account) match {
      case Right(Some(file)) =>
        val fileStream = Source[FileChunk](file.chunks.sortBy(_.position).to[collection.immutable.Seq])
          .via(FileJoiner(storageEngine, 4096))
          .via(Compression.gunzip())

        Ok.chunked(fileStream).withHeaders(
          ("Content-Type", "application/octet-stream"),
          ("Content-Transfer-Encoding", "Binary"),
          ("Content-disposition", s"attachment; filename=${file.node.name}") // TODO with metadata
        )
      case Right(None) =>
        NotFound
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  def upload(path: String) = auth.AuthAction.async(customParser) { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account
    val file = File.initFrom(cleanedPath, account)

    // 100 Mo = 104857600 o
    request.body
      .via(Compression.gzip)
      .via(FileSplitter(storageEngine, conf.getInt("fileStorageEngine.chunk.size").getOrElse(104857600)))
      .runWith(Sink.fold[Seq[FileChunk], FileChunk](Seq.empty[FileChunk])(_ :+ _))
      .map(chunks => {
        fileRepo.insert(file.copy(chunks = chunks))(account) match {
          case Right(f) =>
            Ok(Json.toJson(f))
          case Left(e) =>
            // TODO only create the chunks if the file is successfully created
            chunks.foreach(c => storageEngine.deleteChunk(c.id))
            BadRequest(Json.toJson(e))
        }
      })
  }

  def show(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    fileRepo.getByPath(cleanedPath)(account) match {
      case Right(Some(file)) =>
        Ok(Json.toJson(file))
      case Right(None) =>
        NotFound
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  def create(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    fileRepo.insert(File.initFrom(cleanedPath, account))(account) match {
      case Right(file) =>
        Ok(Json.toJson(file))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }
}
