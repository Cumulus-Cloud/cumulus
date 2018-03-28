package io.cumulus.persistence.storage.engines

import java.nio.file.Paths
import java.util.UUID

import io.cumulus.core.validation.AppError
import io.cumulus.persistence.storage.{StorageEngine, StorageEngineFactory}
import play.api.Configuration
import scala.concurrent.{ExecutionContext, Future}

import akka.stream.IOResult
import akka.stream.scaladsl.{FileIO, Sink, Source}
import akka.util.ByteString

class LocalStorageEngine(val reference: String, storageRootPath: String) extends StorageEngine {

  val name: String = LocalStorage.name
  val version: String = LocalStorage.version

  def getObjectWriter(id: UUID)(implicit e: ExecutionContext): Sink[ByteString, Future[IOResult]] = {
    val objectPath = Paths.get(storageRootPath, id.toString)
    val storagePath = objectPath.getParent

    storagePath.toFile.mkdirs()

    FileIO.toPath(objectPath)
  }

  def getObjectReader(id: UUID)(implicit e: ExecutionContext): Source[ByteString, Future[IOResult]] = {
    val objectPath = Paths.get(storageRootPath, id.toString)

    FileIO.fromPath(objectPath)
  }

  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Right[AppError, Unit]] = {
    val objectPath = Paths.get(storageRootPath, id.toString)
    val file = objectPath.toFile

    if(file.exists)
      file.delete

    Future.successful(Right(()))
  }

}

object LocalStorage extends StorageEngineFactory {

  def name: String = "LocalStorageEngine"
  def version: String = "0.1"

  def create(reference: String, configuration: Configuration): LocalStorageEngine = {
    val storageRootPath = configuration.get[String]("path")

    new LocalStorageEngine(reference, storageRootPath)
  }

}
