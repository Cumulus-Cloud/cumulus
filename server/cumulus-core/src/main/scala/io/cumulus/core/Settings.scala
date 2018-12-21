package io.cumulus.core

import play.api.Configuration

/**
  * Settings of the application
  * @param conf Underlying configuration.
  */
class Settings(
  conf: Configuration
) {

  object management {
    val allowSignUp: Boolean = conf.get[Boolean]("cumulus.management.allow-sign-up")
    val sessionDuration: Int = conf.get[Int]("cumulus.management.session-duration")
  }

  object backgroundTask {
    val maximumParallelism: Int = conf.get[Int]("cumulus.background-task.maximum-parallelism")
  }

  object mail {
    val from: String = conf.get[String]("cumulus.mail.from")
  }

  object host {
    val name: String = conf.get[String]("cumulus.host.name")
    val port: Int = conf.get[Int]("cumulus.host.port")
    val protocol: String = conf.get[String]("cumulus.host.protocol")
    lazy val url = s"$protocol://$name${if (port == 80 || port == 443) "" else s":$port" }"
  }

  object api {
    val paginationMaximumSize: Int = conf.get[Int]("cumulus.api.paginationMaximumSize")
    val paginationDefaultSize: Int = conf.get[Int]("cumulus.api.paginationDefaultSize")
  }

  object storage {
    val chunkSize: Int = conf.get[Int]("cumulus.storage.chunkSize")
    val objectSize: Long = conf.get[Long]("cumulus.storage.objectSize")
  }

}
