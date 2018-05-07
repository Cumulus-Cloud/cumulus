package io.cumulus.core

import play.api.Configuration

/**
  * Settings of the application
  * @param conf Underlying configuration.
  */
class Settings(
  conf: Configuration
) {

  object configuration {
    val path = conf.get[String]("cumulus.configuration.path")
  }

  object api {
    val paginationDefaultSize = conf.get[Int]("cumulus.api.paginationDefaultSize")
  }

  object storage {
    val chunkSize  = conf.get[Int]("cumulus.storage.chunkSize")
    val objectSize = conf.get[Long]("cumulus.storage.objectSize")
  }

}
