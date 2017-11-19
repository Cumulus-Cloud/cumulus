package io.cumulus.persistence.storage

import java.io.{InputStream, OutputStream}
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

import akka.stream.IOResult
import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.util.ByteString
import io.cumulus.core.validation.AppError

trait StorageEngine {

  def version: String

  def name: String

  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Either[AppError, Unit]]

  def writeObject(id: UUID)(implicit e: ExecutionContext): OutputStream

  def readObject(id: UUID)(implicit e: ExecutionContext): InputStream

  def getObject(id: UUID)(implicit e: ExecutionContext): Future[Either[AppError, Source[ByteString, Future[IOResult]]]]

}
