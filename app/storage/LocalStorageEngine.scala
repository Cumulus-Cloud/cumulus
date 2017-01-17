package storage

import java.io._

import play.api.{Logger, Configuration}


class LocalStorageEngine extends FileStorageEngine {

  var path: String = "tmp/"

  private def getFile(name: String): File = new File(path + File.separator + name)

  override def initialize(conf: Configuration): Unit = {
    Logger.debug("Local Storage Engine started")
    path = conf.getString("fileStorageEngine.LocalStorageEngine.path").getOrElse("tmp/")
  }

  override def shutdown(): Unit = {
    Logger.debug("Local Storage Engine shutdown")
  }

  override def name: String = "LocalStorageEngine"

  override def version: String = "0.1"

  override def deleteChunk(name: String): Unit = {
    val file = getFile(name)

    if(file.exists)
      file.delete
  }

  override def readChunk(name: String): InputStream = {
    new FileInputStream(getFile(name))
  }

  override def createChunk(name: String): OutputStream = {
    new FileOutputStream(getFile(name))
  }

  override def isChunkAvailable(name: String): Boolean = {
    val file = getFile(name)
    file.isFile && file.canRead
  }
}

object LocalStorageEngine {
  def apply(configuration: Configuration): LocalStorageEngine = {
    val engine = new LocalStorageEngine()
    engine.initialize(configuration)
    engine
  }
}