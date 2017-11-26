package io.cumulus.core

import play.api.Configuration

class Settings(
  conf: Configuration
) {

  object storage {
    val chunkSize  = conf.get[Int]("cumulus.storage.chunkSize")
    val objectSize = conf.get[Long]("cumulus.storage.objectSize")
  }

  object storageEngines {
    object localStorageEngine {
      val path  = conf.get[String]("storageEngines.localStorageEngine.path")
    }
  }

}
