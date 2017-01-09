package controllers

import java.net.{URLConnection, URLDecoder}
import java.nio.file.{Files, Paths}
import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Compression, Sink, Source}
import akka.util.ByteString
import models.{File, FileChunk, Path}
import play.api.Configuration
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.libs.streams.Accumulator
import play.api.mvc.BodyParser
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils.{FileJoiner, FileSplitter, Log}


@Singleton
class FilesController @Inject() (
  val accountRepo: AccountRepository,
  val directoryRepo: DirectoryRepository,
  val fileRepo: FileRepository,
  val auth: AuthActionService,
  val messagesApi: MessagesApi,
  val conf: Configuration
) extends BaseController with Log {

  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // TODO inject
  val storageEngine = LocalStorageEngine(conf)

  // Custom parser to set the body as a source
  val customParser: BodyParser[Source[ByteString, _]] = BodyParser { req =>
    Accumulator.source[ByteString].map(Right.apply)
  }

  def stream(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(URLDecoder.decode(path, "UTF-8"))
    val account = request.account

    val range = request.headers.get("Range").getOrElse("bytes=0-").split('=').toList match {
      case "bytes" :: r :: Nil => r.split('-').map(_.toInt).toList match {
        case from :: to :: Nil => (from, to)
        case from :: Nil => (from, -1)
        case _ => (0, -1)
      }
      case _ => (0, -1)
    }

    fileRepo.getByPath(cleanedPath)(account) match {
      case Right(Some(file)) =>
        val fileSize = file.chunks.map(_.size).sum
        val realRange = (range._1, if(range._2 > 0) range._2 else fileSize.toInt - 1 ) // TODO check validity & return 406 if not

        println("range => " + range)
        println("size  => " + fileSize)
        println(s"$range - ${fileSize-1}")
        println((fileSize - realRange._1).toString)

        val fileStream = Source[FileChunk](file.chunks.sortBy(_.position).to[collection.immutable.Seq])
          .via(FileJoiner(storageEngine, bufferSize = 4096, offset = realRange._1 /*, max = realRange._2*/)) // TODO handle max
        // TODO fallback to dowload if chunks are compressed or cyphered
        // TODO filter chunks

        PartialContent.chunked(fileStream).withHeaders(
          ("Content-Type", file.metadata.mimeType),
          ("Content-Transfer-Encoding", "Binary"),
          ("Content-Length", (realRange._2 - realRange._1).toString),
          ("Content-Range", s"bytes ${realRange._1}-${realRange._2}/$fileSize"),
          ("Accept-Ranges", "bytes")
        )
      case Right(None) =>
        NotFound
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  /**
    * Plain an simple download for file
 *
    * @param path The path of the file
    * @return The authenticated request to be performed
    */
  def download(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(URLDecoder.decode(path, "UTF-8"))
    val account = request.account

    fileRepo.getByPath(cleanedPath)(account) match {
      case Right(Some(file)) =>
        val fileStream = Source[FileChunk](file.chunks.sortBy(_.position).to[collection.immutable.Seq])
          .via(FileJoiner(storageEngine, 4096))
          //.via(Compression.gunzip()) TODO handle decompression if requested by chunks
          // TODO filter chunks

        Ok.chunked(fileStream).withHeaders(
          ("Content-Type", file.metadata.mimeType),
          ("Content-Transfer-Encoding", "Binary"),
          ("Content-disposition", s"attachment; filename=${file.node.name}")
        )
      case Right(None) =>
        NotFound
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  def upload(path: String) = auth.AuthAction.async(customParser) { implicit request =>

    val cleanedPath = Path.sanitize(java.net.URLDecoder.decode(path, "UTF-8"))
    val account = request.account
    val file = File.initFrom(cleanedPath, account)

    request.body
      //.via(Compression.gzip) TODO handle compression if requested
      .via(FileSplitter(storageEngine, conf.getInt("fileStorageEngine.chunk.size").getOrElse(104857600))) // 100Mo
      .runWith(Sink.fold[Seq[FileChunk], FileChunk](Seq.empty[FileChunk])(_ :+ _))
      .map(chunks => {
        fileRepo.insert(
          file.copy(
            // Add the chunks
            chunks = chunks,
            // Update the metadata to match
            metadata = file.metadata.copy(
              size = chunks.map(_.size).sum,
              mimeType = Option(URLConnection.guessContentTypeFromName(file.node.name)).getOrElse("application/octet-stream")
            )
          )
        )(account) match {
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
