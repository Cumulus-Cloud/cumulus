package io.cumulus.persistence.storage

import java.io.{FileInputStream, FileOutputStream, InputStream, OutputStream}
import java.nio.file.Paths
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

import akka.stream.IOResult
import akka.stream.scaladsl.{FileIO, Source}
import akka.util.ByteString
import io.cumulus.core.Settings
import io.cumulus.core.validation.AppError

class LocalStorageEngine(implicit settings: Settings) extends StorageEngine {

  val storage: String = settings.storageEngines.localStorageEngine.path

  override def name: String = "LocalStorageEngine"

  override def version: String = "0.1"

  def writeObject(id: UUID)(implicit e: ExecutionContext): OutputStream = {
    val objectPath = Paths.get(storage, id.toString)
    val storagePath = objectPath.getParent

    // TODO move
    storagePath.toFile.mkdirs()

    new FileOutputStream(objectPath.toFile)
  }

  def readObject(id: UUID)(implicit e: ExecutionContext): InputStream = {
    val objectPath = Paths.get(storage, id.toString)

    new FileInputStream(objectPath.toFile)
  }

  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Right[AppError, Unit]] = {
    val objectPath = Paths.get(storage, id.toString)
    val file = objectPath.toFile

    if(file.exists)
      file.delete

    Future.successful(Right(()))
  }

}
