package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.controllers.utils.FileDownloader
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.core.utils.Range
import io.cumulus.persistence.services.SharingService
import io.cumulus.persistence.storage.{LocalStorageEngine, StorageEngine}
import play.api.mvc.{AbstractController, ControllerComponents}

class SharingController(
  cc: ControllerComponents,
  sharingService: SharingService
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with FileDownloader {

  // TODO inject
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  // TODO inject
  val storageEngine: StorageEngine = new LocalStorageEngine()

  // TODO generate by user
  // TODO also, derivate the private key from the user's clear password
  val key = "CJkI5LEy+Jtxi/0Dd8/1GA==" // Crypto.randomKey("AES", 128)
  val salt = "DQG+ivnNsojhm1SxDIkg5A==" // Crypto.randomSalt(16)

  def streamRoot(code: String, password: Option[String]) =
    stream("/", code, password)

  def stream(path: String, code: String, password: Option[String]) = Action.async { implicit request =>

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

    sharingService.findSharedFile(code, path, password, None).map {
      case Right(file) =>

        val realRange = (headerRange._1, if(headerRange._2 > 0) headerRange._2 else file.size - 1 ) // TODO check validity & return 406 if not
      val range = Range(realRange._1, realRange._2)

        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(key, salt).get)
            .via(Compression.gunzip())

        streamFile(storageEngine, file, transformation, range)

      case Left(e) =>
        toApiError(e)
    }
  }

  def downloadRoot(code: String, password: Option[String], forceDownload: Option[Boolean]) =
    download("/", code, password, forceDownload)

  def download(path: String, code: String, password: Option[String], forceDownload: Option[Boolean]) = Action.async { implicit request =>

    sharingService.findSharedFile(code, path, password, None).map {
      case Right(file) =>

        // TODO guess from the file and/or chunks
        val transformation =
          Flow[ByteString]
            .via(AESCipher.decrypt(key, salt).get)
            .via(Compression.gunzip())

        downloadFile(storageEngine, file, transformation, forceDownload.getOrElse(false))

      case Left(e) =>
        toApiError(e)
    }
  }

  def get(path: String, code: String, password: Option[String]) = Action.async { implicit request =>
    ApiResponse {
      sharingService.findSharedNode(code, path, password, None)
    }
  }

}
