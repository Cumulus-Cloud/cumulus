package storage

import java.io.{InputStream, OutputStream}
import java.util.UUID

import play.api.Configuration

trait FileStorageEngine {

  def initialize(conf: Configuration): Unit

  def version: String = "1.0"

  def name: String

  def createChunk(name: UUID): OutputStream = createChunk(name.toString)

  def createChunk(name: String): OutputStream

  def readChunk(name: UUID): InputStream = readChunk(name.toString)

  def readChunk(name: String): InputStream

  def deleteChunk(name: String): Unit

  def deleteChunk(name: UUID): Unit = deleteChunk(name.toString)

  def isChunkAvailable(name: String): Boolean

  def isChunkAvailable(name: UUID): Boolean = isChunkAvailable(name.toString)

  def shutdown(): Unit

  override def finalize = {
    // TODO clean version
    shutdown()
  }
}
