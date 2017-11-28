package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.core.utils.{Base16, Base64}
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

        val range = headerRange(request, file)
        val (privateKey, salt) = (
          sharing.security.privateKey(Base16.decode(key).get),
          Base64.decode(sharing.security.privateKeySalt).get
        )

        // TODO guess from the file and/or chunks
        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(privateKey, salt))
            .via(Compression.gunzip())

        streamFile(storageEngine, file, transformation, range)

      case Left(e) =>
        toApiError(e)
    }
  }

  def downloadRoot(reference: String, key: String, forceDownload: Option[Boolean]) =
    download("/", reference, key, forceDownload)

  def download(path: Path, reference: String, key: String, forceDownload: Option[Boolean]) = Action.async { implicit request =>
    sharingService.findSharedFile(reference, path, key).map {
      case Right((sharing, file)) =>

        val (privateKey, salt) = (
          sharing.security.privateKey(Base16.decode(key).get),
          Base64.decode(sharing.security.privateKeySalt).get
        )

        // TODO guess from the file and/or chunks
        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(privateKey, salt))
            .via(Compression.gunzip())

        downloadFile(storageEngine, file, transformation, forceDownload.getOrElse(false))

      case Left(e) =>
        toApiError(e)
    }
  }

}
