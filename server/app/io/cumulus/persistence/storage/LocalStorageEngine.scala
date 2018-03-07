package io.cumulus.persistence.storage

import java.io.{FileInputStream, FileOutputStream, InputStream, OutputStream}
import java.nio.file.Paths
import java.util.UUID

import scala.concurrent.{ExecutionContext, Future}
import io.cumulus.core.Settings
import io.cumulus.core.validation.AppError
import play.api.Configuration

class LocalStorageEngine(val reference: String, storageRootPath: String) extends StorageEngine {

  val name = LocalStorage.name
  val version = LocalStorage.version

  def writeObject(id: UUID)(implicit e: ExecutionContext): OutputStream = {
    val objectPath = Paths.get(storageRootPath, id.toString)
    val storagePath = objectPath.getParent

    storagePath.toFile.mkdirs()

    new FileOutputStream(objectPath.toFile)
  }

  def readObject(id: UUID)(implicit e: ExecutionContext): InputStream = {
    val objectPath = Paths.get(storageRootPath, id.toString)

    new FileInputStream(objectPath.toFile)
  }

  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Right[AppError, Unit]] = {
    val objectPath = Paths.get(storageRootPath, id.toString)
    val file = objectPath.toFile

    if(file.exists)
      file.delete

    Future.successful(Right(()))
  }

  override def listObjects(implicit e: ExecutionContext) = ???

}

object LocalStorage extends StorageEngineFactory {

  def name: String = "LocalStorageEngine"
  def version: String = "0.1"

  def create(reference: String, configuration: Configuration) = {
    val storageRootPath = configuration.get[String]("path")

    new LocalStorageEngine(reference, storageRootPath)
  }

}
