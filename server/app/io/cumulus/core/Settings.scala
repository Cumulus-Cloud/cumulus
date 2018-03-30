package io.cumulus.core

import play.api.Configuration

/**
  * Settings of the application
  * @param conf Underlying configuration.
  */
class Settings(
  conf: Configuration
) {

  object storage {
    val chunkSize  = conf.get[Int]("cumulus.storage.chunkSize")
    val objectSize = conf.get[Long]("cumulus.storage.objectSize")
  }

}
