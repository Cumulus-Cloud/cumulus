package controllers

import java.net.{URLConnection, URLDecoder}
import java.security.{SecureRandom, MessageDigest}
import javax.crypto.spec.SecretKeySpec
import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Flow, Compression, Source}
import akka.util.ByteString
import models.{File, Path}
import play.api.Configuration
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.libs.streams.Accumulator
import play.api.mvc.BodyParser
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils._
import utils.streams.{AESCipher, FileDownloader, FileUploaderSink}


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

    val cleanedPath = Path.sanitize(path)
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
        val fileSize = file.metadata.size
        val realRange = (range._1, if(range._2 > 0) range._2 else fileSize.toInt - 1 ) // TODO check validity & return 406 if not

        println("range => " + range)
        println("size  => " + fileSize)
        println(s"$range - ${fileSize-1}")
        println((fileSize - realRange._1).toString)

        val fileStream = Source.fromGraph(FileDownloader(storageEngine, file.sources.head, realRange._1, realRange._2))
        // TODO fallback to dowload if chunks are compressed or cyphered
        // TODO filter chunks

        PartialContent.chunked(fileStream).withHeaders(
          ("Content-Transfer-Encoding", "Binary"),
          ("Content-Length", (realRange._2 - realRange._1).toString),
          ("Content-Range", s"bytes ${realRange._1}-${realRange._2}/$fileSize"),
          ("Accept-Ranges", "bytes")
        ).as(file.metadata.mimeType)
      case Right(None) =>
        NotFound
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  // Random IV
  val rand = new SecureRandom()
  val randomIv = { // TODO save the random IV per file, in the database
    ByteString(-72, -125, -75, 37, 84, 32, -54, 77, 61, 19, -126, -81, -104, -48, 46, 127).toArray
  }

  // AES key
  private val passphrase = "hello i'm your secret key" // TODO get the key from somewhere, maybe config, database ?
  private val AESKey = {
    val key = MessageDigest.getInstance("SHA-1")
      .digest(passphrase.getBytes("UTF-8"))
      .slice(0, 16) // First 128 bit // TODO use 256 ? more ?

    new SecretKeySpec(key, "AES")
  }

  /**
    * Plain an simple download for file
    *
    * @param path The path of the file
    * @return The authenticated request to be performed
    */
   def download(path: String) = auth.AuthAction { implicit request =>
    val cleanedPath = Path.sanitize(path)
    val account = request.account

    fileRepo.getByPath(cleanedPath)(account) match {
      case Right(Some(file)) =>
        file.sources match {
          case source :: tail => // TODO other way to get a source.. + filter if available
            val fileStream = Source.fromGraph(FileDownloader(storageEngine, file.sources.head))
            .via(AESCipher.decryptor(AESKey, randomIv)) //TODO handle decompression if requested by chunks

            Ok.chunked(fileStream).withHeaders(
              ("Content-Transfer-Encoding", "Binary"),
              if(request.request.queryString.contains("download"))
                ("Content-disposition", s"attachment; filename=${file.node.name}")
              else
                ("", "")
            ).as(file.metadata.mimeType)
          case Nil =>
            NotFound // TODO better error message
        }
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

    // Get requested compression and/or cipher
    // TODO
    val compression = Flow.fromFunction[ByteString, ByteString](identity)
    /*request.getQueryString("compression") match {
      case Some("GZIP") => Compression.gzip
      case Some("DEFLATE") => Compression.deflate
      case _ => Flow.fromFunction[ByteString, ByteString](identity)
    }*/

    // TODO
    val cipher = AESCipher.encryptor(AESKey, randomIv)
    /*request.getQueryString("cipher") match {
      case Some("AES") => AESCipher.encryptor(null, null)
      case _ => Flow.fromFunction[ByteString, ByteString](identity)
    }*/

    request.body
      .via(cipher)
      .via(compression)
      .runWith(FileUploaderSink(storageEngine))
      .map(fileSource => {
        fileRepo.insert(
          file.copy(
            // Add the file source
            sources = Seq(fileSource),
            // Update the metadata to match
            metadata = file.metadata.copy(
              size = fileSource.size,
              mimeType = Option(URLConnection.guessContentTypeFromName(file.node.name)).getOrElse("application/octet-stream")
            )
          )
        )(account) match {
          case Right(f) =>
            Ok(Json.toJson(f))
          case Left(e) =>
            // TODO only create the chunks if the file is successfully created
            storageEngine.deleteFile(fileSource.id)
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
