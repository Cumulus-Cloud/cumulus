package storage

import java.io._

import play.api.{Logger, Configuration}


class LocalStorageEngine extends FileStorageEngine {

  var path: String = "tmp/"

  override def initialize(conf: Configuration): Unit = {
    Logger.debug("Local Storage Engine started")

    path = conf.getString("path").getOrElse("tmp/")
  }

  override def shutdown(): Unit = {
    Logger.debug("Local Storage Engine shutdown")
  }

  override def name: String = "LocalStorageEngine"

  override def version: String = "0.1"

  override def deleteChunk(name: String): Unit = {
    val file = new File(path + "/" + name)

    if(file.exists)
      file.delete
  }

  override def readChunk(name: String): InputStream = {
    new FileInputStream(new File(path + "/" + name))
  }

  override def createChunk(name: String): OutputStream = {
    new FileOutputStream(new File(path + "/" + name))
  }
}

object LocalStorageEngine {
  def apply: LocalStorageEngine = new LocalStorageEngine()
}