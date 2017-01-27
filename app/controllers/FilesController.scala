package controllers

import java.net.URLConnection
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import javax.inject.{Inject, Singleton}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Compression, Flow, Sink, Source}
import akka.util.ByteString
import models.{Account, File, FileSource}
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.libs.streams.Accumulator
import play.api.mvc._
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils.EitherUtils._
import utils.Utils.Crypto._
import utils._
import utils.streams.{AESCipher, FileDownloader, FileUploaderSink}

import scala.concurrent.Future
import scala.util.Try

@Singleton
class FilesController @Inject() (
  auth: AuthenticationActionService,
  fsActions: FsActionService,
  directoryRepo: DirectoryRepository,
  accountRepo: AccountRepository,
  fileRepo: FileRepository,
  messagesApi: MessagesApi,
  conf: Conf
) extends Controller with Log {

  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val confImplicit = conf
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // TODO inject
  val storageEngine = LocalStorageEngine(conf.all)

  case class RequestWithFile[A](file: File, account: Account, request: Request[A]) extends WrappedRequest[A](request)

  def ActionWithFile(path: String) =
    auth.AuthenticatedAction andThen
    fsActions.ActionWithPath(path) andThen
    new ActionRefiner[fsActions.RequestWithPath, RequestWithFile] {
      def refine[A](request: fsActions.RequestWithPath[A]) = Future.successful {
        val path = request.filePath
        val account = request.account

        fileRepo.getByPath(path)(account) match {
          case Right(Some(file)) => Right(RequestWithFile(file, account, request))
          case Right(None) => Left(NotFound("TODO error")) // TODO
          case Left(e) => Left(BadRequest(Json.toJson(e)))
        }
      }
    }

  // Custom parser to set the body as a source
  val customParser: BodyParser[Source[ByteString, _]] = BodyParser { req =>
    Accumulator.source[ByteString].map(Right.apply)
  }

  def stream(path: String) = ActionWithFile(path) { implicit request =>
    val range = request.headers.get("Range").getOrElse("bytes=0-").split('=').toList match {
      case "bytes" :: r :: Nil => r.split('-').map(_.toInt).toList match {
        case from :: to :: Nil => (from, to)
        case from :: Nil => (from, -1)
        case _ => (0, -1)
      }
      case _ => (0, -1)
    }

    val fileSize = request.file.metadata.size
    val realRange = (range._1, if(range._2 > 0) range._2 else fileSize.toInt - 1 ) // TODO check validity & return 406 if not

    request.file.sources /* .orderBy(_.priority) */ match {
      case source :: _ =>
        if(source.cipher.isDefined || source.compression.isDefined)
          Redirect(routes.FilesController.download(path)) // Can't stream if compressed or ciphered, redirect to download
        else {
          val fileStream = Source.fromGraph(FileDownloader(storageEngine, source, realRange._1, realRange._2))

          PartialContent.chunked(fileStream).withHeaders(
            ("Content-Transfer-Encoding", "Binary"),
            ("Content-Length", (realRange._2 - realRange._1).toString),
            ("Content-Range", s"bytes ${realRange._1}-${realRange._2}/$fileSize"),
            ("Accept-Ranges", "bytes")
          ).as(request.file.metadata.mimeType)
        }
      case Nil =>
        NotFound // TODO better error message
    }
  }

  // Helper to extract the required information for AES
  private def getSaltAndKeyForAES(account: Account, source: FileSource): Either[Result, (ByteString, SecretKey)] = Try {
      for {
        key <- Utils.Crypto.decrypt(account.key) match {
          case Some(key) => Right(new SecretKeySpec(key.toArray.slice(0, 16), "AES"))
          case None => Left(BadRequest("Error - No account key")) // TODO
        }
        salt64 <- source.key match {
          case Some(salt64) => Right(salt64)
          case None => Left(BadRequest("Error - No salt provided, but required for AES")) // TODO
        }
        salt <- Utils.decodeBase64(salt64) match {
          case Some(salt) => Right(salt)
          case None => Left(BadRequest("Error - Salt can't be read, but is required for AES")) // TODO
        }
      } yield (salt, key)
    } getOrElse Left(BadRequest("Error - Internal error")) // TODO log the error ?

  /**
    * Plain an simple download for file
    *
    * @param path The path of the file
    * @return The authenticated request to be performed
    */
   def download(path: String) = ActionWithFile(path) { implicit request =>
    val forceDownload = request.request.queryString.contains("download")

    (for {
      source <- request.file.sources /* .orderBy(_.priority) */ match { // TODO prioritize
        case source :: _ => Right(source)
        case Nil => Left(NotFound("TODO - no content")) // TODO better error message
      }
      decompression <- source.compression match {
        case Some("DEFLATE") => Right(Compression.inflate())
        case Some("GZIP") => Right(Compression.gunzip())
        case None => Right(Flow.fromFunction[ByteString, ByteString](identity))
        case _ => Left(BadRequest("TODO - Unknown compression"))
      }
      cipher <- source.cipher match {
        case Some("AES") =>
          getSaltAndKeyForAES(request.account, source).map {
            case (salt, key) =>
              AESCipher.decryptor(key, salt)
          }
        case None => Right(Flow.fromFunction[ByteString, ByteString](identity))
        case _ => Left(BadRequest("TODO - Unknown cipher"))
      }
    } yield (source, decompression, cipher)).fold(identity, {
      case (source, decompression, cipher) =>
        val fileStream = Source.fromGraph(FileDownloader(storageEngine, source))
          .via(decompression)
          .via(cipher)

        Ok.chunked(fileStream).withHeaders(
          ("Content-Transfer-Encoding", "Binary"),
          if (forceDownload)
            ("Content-disposition", s"attachment; filename=${request.file.node.name}") // Force download
          else
            ("", "")
        ).as(request.file.metadata.mimeType)
    })
  }

  // Helper to extract and generate the required information for AES
  private def generateSaltAndGetKeyForAES(account: Account): Either[Result, (ByteString, SecretKey)] = Try {
      for {
        key <- Utils.Crypto.decrypt(account.key) match {
          case Some(key) => Right(new SecretKeySpec(key.toArray.slice(0, 16), "AES"))
          case None => Left(BadRequest("Error - No account key")) // TODO
        }
        salt <- Right(Utils.Crypto.randomSalt(16))
      } yield (salt, key)
    } getOrElse Left(BadRequest("Error - Internal error")) // TODO log the error ?

  /**
    * File upload endpoint. Takes all the body as whole file
    *
    * @param path The path for the future file
    * @return The authenticated request to be performed
    */
  def upload(path: String) = fsActions.AuthenticatedActionWithPath(path).async(customParser) { implicit request =>

    val cleanedPath = request.filePath
    val account = request.account
    val file = File.initFrom(cleanedPath, account)

    val cipherName = request.getQueryString("cipher").map(_.toUpperCase)
    val compressionName = request.getQueryString("compression").map(_.toUpperCase)

    (for {
      compression <- compressionName match {
        case Some("DEFLATE") => Right(Compression.deflate)
        case Some("GZIP") => Right(Compression.gzip)
        case None => Right(Flow.fromFunction[ByteString, ByteString](identity))
        case _ => Left(BadRequest("TODO - Unknown compression"))
      }
      cipher <- cipherName match {
        case Some("AES") =>
          // We need to get the secret key to cipher the file
          generateSaltAndGetKeyForAES(account).map {
            case (salt, key) =>
              (Some(salt), AESCipher.encryptor(key, salt))
          }
        case None => Right((None, Flow.fromFunction[ByteString, ByteString](identity)))
        case _ => Left(BadRequest("TODO - Unknown cipher"))
      }
    } yield (compression, cipher)).fold({ error =>
      request.body.runWith(Sink.cancelled)
      Future.successful(error)
    }, {
      case (compression, Tuple2(salt, cipher)) =>
        request.body
          .via(cipher)
          .via(compression)
          .runWith(FileUploaderSink(storageEngine))
          .map(fileSource => {
            fileRepo.insert(
              file.copy(
                // Add the file source
                sources = Seq(fileSource.copy(
                  cipher = cipherName,
                  key = salt.map(Utils.encodeBase64), // Salt doesn't need to be protected
                  compression = compressionName
                )),
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
                storageEngine.deleteFile(fileSource.id)
                BadRequest(Json.toJson(e))
            }
          })
    })
  }

  def delete(path: String) = ActionWithFile(path) {
    implicit request =>
      fileRepo.delete(request.file) match {
        case Right(_) =>
          Ok(Json.toJson(request.file))
        case Left(e) =>
          BadRequest(Json.toJson(e))
      }
  }

  def show(path: String) = ActionWithFile(path) {
    implicit request =>
      Ok(Json.toJson(request.file))
  }

  def create(path: String) = fsActions.AuthenticatedActionWithPath(path) { implicit request =>

    val path = request.filePath
    val account = request.account

    fileRepo.insert(File.initFrom(path, account))(account) match {
      case Right(file) =>
        Ok(Json.toJson(file))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }
}
