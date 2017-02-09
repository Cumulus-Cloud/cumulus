package storage

import java.io.{InputStream, OutputStream}
import java.util.UUID

import play.api.Configuration

trait FileStorageEngine {

  def initialize(conf: Configuration): Unit

  def version: String = "1.0"

  def name: String

  def createFile(name: UUID): OutputStream = createFile(name.toString)

  def createFile(name: String): OutputStream

  def readFile(name: UUID): InputStream = readFile(name.toString)

  def readFile(name: String): InputStream

  def deleteFile(name: String): Unit

  def deleteFile(name: UUID): Unit = deleteFile(name.toString)

  def isFileAvailable(name: String): Boolean

  def isFileAvailable(name: UUID): Boolean = isFileAvailable(name.toString)

  def shutdown(): Unit

  override def finalize = {
    // TODO clean version
    shutdown()
  }
}
