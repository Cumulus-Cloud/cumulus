package io.cumulus.persistence.storage

import java.io.{FileInputStream, FileOutputStream, InputStream, OutputStream}
import java.nio.file.Paths
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

import akka.stream.IOResult
import akka.stream.scaladsl.{FileIO, Source}
import akka.util.ByteString
import io.cumulus.core.validation.AppError

sealed trait StorageEngineResult

case class StorageEngineFailed(error: String, exception: Option[Throwable]) extends StorageEngineResult

case class StorageEngineSuccessful() extends StorageEngineResult

class LocalStorageEngine extends StorageEngine {

  val storage: String = "tmp/"

  override def name: String = "LocalStorageEngine"

  override def version: String = "0.1"


  def writeObject(id: UUID)(implicit e: ExecutionContext): OutputStream = {
    val objectPath = Paths.get(storage, id.toString)
    val storagePath = Paths.get(storage)

    // TODO move
    storagePath.toFile.mkdirs()

    new FileOutputStream(objectPath.toFile)
  }

  def readObject(id: UUID)(implicit e: ExecutionContext): InputStream = {
    val objectPath = Paths.get(storage, id.toString)

    new FileInputStream(objectPath.toFile)
  }


  def getObject(id: UUID)(implicit e: ExecutionContext): Future[Either[AppError, Source[ByteString, Future[IOResult]]]] = {
    val objectPath = Paths.get(storage, id.toString)

    Future.successful(Right(FileIO.fromPath(objectPath)))

    /*
    FileIO.fromPath(objectPath)
      .mapMaterializedValue[Future[StorageEngineResult]] { mat =>
        mat.map { r =>
          r.status
            .toEither
            .left.map(e => StorageEngineFailed(e.getMessage, Some(e)))
            .map(_ => StorageEngineSuccessful())
            .merge
        }
      }*/
  }

  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Right[AppError, Unit]] = {
    val objectPath = Paths.get(storage, id.toString)
    val file = objectPath.toFile

    if(file.exists)
      file.delete

    Future.successful(Right(()))
  }

}
