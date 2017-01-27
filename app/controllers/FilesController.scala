package controllers

import java.net.URLConnection
import java.security.MessageDigest
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import javax.inject.{Inject, Singleton}

import akka.NotUsed
import akka.actor.ActorSystem
import akka.stream.{Graph, FlowShape, ActorMaterializer}
import akka.stream.scaladsl.{Compression, Flow, Source}
import akka.util.ByteString
import models.{Account, File, Path}
import play.api.Configuration
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.libs.streams.Accumulator
import play.api.mvc._
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils.EitherUtils._
import utils._
import utils.Utils.Crypto._
import utils.streams.{AESCipher, FileDownloader, FileUploaderSink}

import scala.concurrent.Future

@Singleton
class FilesController @Inject() (
  val auth: AuthenticationActionService,
  val directoryRepo: DirectoryRepository,
  val accountRepo: AccountRepository,
  val fileRepo: FileRepository,
  val messagesApi: MessagesApi,
  val conf: Conf
) extends BaseController with Log {

  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val confImplicit = conf
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // TODO inject
  val storageEngine = LocalStorageEngine(conf.all)

  case class RequestWithPath[A](filePath: String, account: Account, request: Request[A]) extends WrappedRequest[A](request)

  def ActionWithPath(path: String) = new ActionRefiner[AuthenticatedRequest, RequestWithPath] {
    def refine[A](request: AuthenticatedRequest[A]) = Future.successful {
      Path.sanitize(path) match {
        case p if p.isEmpty => Left(BadRequest("TODO invalid path")) // TODO
        case p => Right(RequestWithPath(p,request.account, request))
      }
    }
  }

  def AuthenticatedActionWithPath(path: String) = auth.AuthenticatedAction andThen ActionWithPath(path)

  case class RequestWithFile[A](file: File, account: Account, request: Request[A]) extends WrappedRequest[A](request)

  def ActionWithFile(path: String) =
    auth.AuthenticatedAction andThen
    ActionWithPath(path) andThen
    new ActionRefiner[RequestWithPath, RequestWithFile] {
      def refine[A](request: RequestWithPath[A]) = Future.successful {
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

    request.file.sources match {
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
   def download(path: String) = ActionWithFile(path) { implicit request =>
    val forceDownload = request.request.queryString.contains("download")

    (for {
      source <- request.file.sources /* .orderBy(_.priority) */ match { // TODO prioritize
        case source :: _ => Right(source)
        case Nil => Left(NotFound("TODO")) // TODO better error message
      }
      decompression <- source.compression match {
        case Some("DEFLATE") => Right(Compression.deflate)
        case Some("GZIP") => Right(Compression.gzip)
        case None => Right(Flow.fromFunction[ByteString, ByteString](identity))
        case _ => Left(BadRequest("TODO"))
      }
      cipher <- source.cipher match {
        case Some("AES") =>
          // TODO put into a try
          extractHashAndKey(source.secretKey.getOrElse("")) match {
            case Some((salt, key)) =>
              Right(AESCipher.encryptor(new SecretKeySpec(key.toArray, "AES"), salt))
            case None =>
              Left(BadRequest("TODO"))
          }
        case None => Right(Flow.fromFunction[ByteString, ByteString](identity))
        case _ => Left(BadRequest("TODO"))
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

  case class CipherHolder(salt: Option[ByteString], key: Option[SecretKey], stream: Graph[FlowShape[ByteString, ByteString], NotUsed])

  /**
    * File upload endpoint. Takes all the body as whole file
    *
    * @param path The path for the future file
    * @return The authenticated request to be performed
    */
  def upload(path: String) = AuthenticatedActionWithPath(path).async(customParser) { implicit request =>

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
        case _ => Left(BadRequest("TODO"))
      }
      cipher <- cipherName match {
        case Some("AES") =>
          // TODO put into a try
          val AESKey = Utils.Crypto.randomKey("AES", 256)
          val salt = Utils.Crypto.randomSalt(16)
          Right(CipherHolder(Some(salt), Some(AESKey), AESCipher.encryptor(AESKey, salt)))
        case None => Right(CipherHolder(None, None, Flow.fromFunction[ByteString, ByteString](identity)))
        case _ => Left(BadRequest("TODO"))
      }
    } yield (compression, cipher)).fold(Future.successful(_), {
      case (compression, cipher) =>
        request.body
          .via(cipher.stream)
          .via(compression)
          .runWith(FileUploaderSink(storageEngine))
          .map(fileSource => {
            fileRepo.insert(
              file.copy(
                // Add the file source
                sources = Seq(fileSource.copy(
                  cipher = cipherName,
                  secretKey = cipher.key.map(k => {
                    Utils.encodeBase64(cipher.salt.getOrElse(ByteString.empty)) + "$" + Utils.encodeBase64(k.getEncoded)
                  }),
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

  def show(path: String) = ActionWithFile(path) {
    implicit request =>
      Ok(Json.toJson(request.file))
  }

  def create(path: String) = AuthenticatedActionWithPath(path) { implicit request =>

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
