package io.cumulus

import io.cumulus.utils.Configuration
import pdi.jwt.JwtAlgorithm
import pdi.jwt.algorithms.JwtHmacAlgorithm

/**
  * Settings of the application
 *
 * @param conf Underlying configuration.
  */
class Settings(
  conf: Configuration
) {

  object security {
    val secret: String = conf.get[String]("cumulus.security.secret")
    val algorithm: JwtHmacAlgorithm =
      JwtAlgorithm.fromString(conf.get[String]("cumulus.security.algorithm")) match {
        case algorithm: JwtHmacAlgorithm =>
          algorithm
        case algorithm =>
          throw new Exception(s"Unsupported algorithm configured $algorithm")
      }
    val sessionDuration: Int = conf.get[Int]("cumulus.security.session-duration")
  }

  object database {
    val url: String = conf.get[String]("cumulus.database.url")
    val user: String = conf.get[String]("cumulus.database.user")
    val password: String = conf.get[String]("cumulus.database.password")

    object pool {
      val minSize: Int = conf.get[Int]("cumulus.database.pool.min-size")
      val maxSize: Int = conf.get[Int]("cumulus.database.pool.max-size")
      val connectionTimeout: Int = conf.get[Int]("cumulus.database.pool.connection-timeout")
    }
  }

  val underlying: Configuration =
    conf

  object management {
    val allowSignUp: Boolean = conf.get[Boolean]("cumulus.management.allow-sign-up")
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
