package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.controllers.utils.FileDownloader
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.core.utils.{Base16, Base64, Range}
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
) extends AbstractController(cc) with ApiUtils with FileDownloader {

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

    // TODO duplicated
    val headerRange: (Long, Long) =
      request.headers.get("Range").getOrElse("bytes=0-").split('=').toList match {
        case "bytes" :: r :: Nil => r.split('-').map(_.toLong).toList match {
          case from :: to :: Nil => (from, to)
          case from :: Nil => (from, -1)
          case _ => (0, -1)
        }
        case _ => (0, -1)
      }

    sharingService.findSharedFile(reference, path, key).map {
      case Right((sharing, file)) =>

        val (privateKey, salt) = (
          sharing.security.privateKey(Base16.decode(key).get),
          Base64.decode(sharing.security.privateKeySalt).get
        )

        val realRange = (headerRange._1, if(headerRange._2 > 0) headerRange._2 else file.size - 1 ) // TODO check validity & return 406 if not
        val range = Range(realRange._1, realRange._2)

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
