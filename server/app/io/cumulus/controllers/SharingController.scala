package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.core.utils.Base16
import io.cumulus.core.validation.AppError
import io.cumulus.models.Path
import io.cumulus.persistence.services.SharingService
import io.cumulus.persistence.storage.StorageEngine
import play.api.mvc.{AbstractController, ControllerComponents}

class SharingController(
  cc: ControllerComponents,
  sharingService: SharingService,
  storageEngine: StorageEngine
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with FileDownloaderUtils {

  def get(path: Path, reference: String, key: String) = Action.async { implicit request =>
    ApiResponse {
      sharingService.findSharedNode(reference, path, key).map {
        case Right((_, node)) =>
          Right(node)
        case Left(e) =>
          Left(e)
      }
    }
  }

  def streamRoot(reference: String, key: String) =
    stream("/", reference, key)

  def stream(path: Path, reference: String, key: String) = Action.async { implicit request =>
    sharingService.findSharedFile(reference, path, key).map {
      case Right((sharing, file)) =>

        (for {
          range      <- headerRange(request, file)
          decodedKey <- Base16.decode(key).toRight(AppError.validation("Invalid key provided")) // TODO
          privateKey  = sharing.security.privateKey(decodedKey)
          salt        = sharing.security.privateKeySalt
        } yield {

          // TODO guess from the file and/or chunks
          val transformation =
            Flow[ByteString]
              .via(AESCipher.decrypt(privateKey, salt))
              .via(Compression.gunzip())

          streamFile(storageEngine, file, transformation, range)

        }).left.map(toApiError).merge

      case Left(e) =>
        toApiError(e)
    }
  }

  def downloadRoot(reference: String, key: String, forceDownload: Option[Boolean]) =
    download("/", reference, key, forceDownload)

  def download(path: Path, reference: String, key: String, forceDownload: Option[Boolean]) = Action.async { implicit request =>
    sharingService.findSharedFile(reference, path, key).map {
      case Right((sharing, file)) =>

        Base16.decode(key).toRight(AppError.validation("validation.sharing.invalid-key")).map { privateKey =>
          val salt = sharing.security.privateKeySalt

          // TODO guess from the file and/or chunks
          val transformation =
            Flow[ByteString]
              .via(AESCipher.decrypt(privateKey, salt))
              .via(Compression.gunzip())

          downloadFile(storageEngine, file, transformation, forceDownload.getOrElse(false))
        }.left.map(toApiError).merge

      case Left(e) =>
        toApiError(e)
    }
  }

}
