package io.cumulus.core

import java.io.File

import com.typesafe.config.ConfigFactory
import play.api.Configuration

/**
  * Settings of the application
  * @param initialConfiguration Initial configuration.
  */
class Settings(
  private val initialConfiguration: Configuration
) {

  /** Underlying configuration. */
  val underlying: Configuration = {
    initialConfiguration ++
      Configuration(ConfigFactory.parseFile(new File(initialConfiguration.get[String]("cumulus.configuration.path"))))
  }

  object configuration {
    val path: String = underlying.get[String]("cumulus.configuration.path")
  }

  object management {
    val installation: Boolean  = underlying.getOptional[Boolean]("cumulus.management.installation").getOrElse(false)
    val allowRecovery: Boolean = underlying.getOptional[Boolean]("cumulus.management.allowRecovery").getOrElse(false)
    val allowSignUp: Boolean   = underlying.get[Boolean]("cumulus.management.allow-sign-up")
    val sessionDuration: Int   = underlying.get[Int]("cumulus.management.session-duration")
  }

  object mail {
    val from: String = underlying.get[String]("cumulus.mail.from")
  }

  object host {
    val name: String     = underlying.get[String]("cumulus.host.name")
    val port: Int        = underlying.get[Int]("cumulus.host.port")
    val protocol: String = underlying.get[String]("cumulus.host.protocol")

    lazy val url = s"$protocol://$name${if (port == 80 || port == 443) "" else s":$port" }"
  }

  object api {
    val paginationDefaultSize: Int = underlying.get[Int]("cumulus.api.paginationDefaultSize")
  }

  object storage {
    val chunkSize: Int   = underlying.get[Int]("cumulus.storage.chunkSize")
    val objectSize: Long = underlying.get[Long]("cumulus.storage.objectSize")
  }

}
