package io.cumulus

import io.cumulus.i18n.Lang
import io.cumulus.stages.{AESCipherStage, Ciphers, Compressions, DeflateStage, GzipStage}
import io.cumulus.utils.Configuration
import pdi.jwt.JwtAlgorithm
import pdi.jwt.algorithms.JwtHmacAlgorithm

import scala.concurrent.duration.FiniteDuration


/**
  * Settings of the application
 *
 * @param conf Underlying configuration.
  */
class Settings(
  conf: Configuration
) {

  val underlying: Configuration =
    conf

  object app {
    val allowSignUp: Boolean = conf.get[Boolean]("cumulus.app.allow-sign-up")
    val mode: AppEnv = if (conf.get[String]("cumulus.app.mode") == "dev") Dev else Prod
    val langs: Set[Lang] = conf.get[Seq[String]]("cumulus.app.langs").toSet.map(Lang(_))
  }

  object http {
    val hostname: String = conf.get[String]("cumulus.http.hostname")
    val port: Int = conf.get[Int]("cumulus.http.port")
    val protocol: String = conf.get[String]("cumulus.http.protocol")
    lazy val url = s"$protocol://$hostname${if (port == 80 || port == 443) "" else s":$port" }"
    val timeout: FiniteDuration = conf.get[FiniteDuration]("cumulus.http.timeout")
  }

  object security {
    val secret: String = conf.get[String]("cumulus.security.secret")
    val algorithm: JwtHmacAlgorithm =
      JwtAlgorithm.fromString(conf.get[String]("cumulus.security.algorithm")) match {
        case algorithm: JwtHmacAlgorithm =>
          algorithm
        case algorithm =>
          throw new Exception(s"Unsupported algorithm configured $algorithm")
      }
    val sessionDuration: FiniteDuration = conf.get[FiniteDuration]("cumulus.security.session-duration")
  }

  val database = {

    val dbConfigurations = conf.get[Configuration]("cumulus.database")

    dbConfigurations
      .subKeys
      .map { key =>
        val dbConfiguration = dbConfigurations.get[Configuration](key)

        val databaseSettings =
          DatabaseSettings(
            driver = dbConfiguration.get[String]("driver"),
            url = dbConfiguration.get[String]("url"),
            user = dbConfiguration.get[String]("user"),
            password = dbConfiguration.get[String]("password"),
            pool = DatabasePoolSettings(
              minSize = dbConfiguration.get[Int]("pool.min-size"),
              maxSize = dbConfiguration.get[Int]("pool.max-size"),
              connectionTimeout = dbConfiguration.get[FiniteDuration]("pool.connection-timeout")
            )
          )

        key -> databaseSettings
      }
      .toMap
  }

  object backgroundTask {
    val maximumParallelism: Int = conf.get[Int]("cumulus.background-task.maximum-parallelism")
  }

  object mail {
    val host: String = conf.get[String]("cumulus.mail.host")
    val port: Int = conf.get[Int]("cumulus.mail.port")
    val ssl: Boolean = conf.get[Option[Boolean]]("cumulus.mail.ssl").getOrElse(false)
    val tls: Boolean = conf.get[Option[Boolean]]("cumulus.mail.tls").getOrElse(false)
    val auth: Boolean = conf.get[Option[Boolean]]("cumulus.mail.auth").getOrElse(false)
    val user: String = conf.get[Option[String]]("cumulus.mail.user").getOrElse("")
    val password: String = conf.get[Option[String]]("cumulus.mail.password").getOrElse("")

    val from: String = conf.get[String]("cumulus.mail.from")
    val personal: String = conf.get[String]("cumulus.mail.personal")
  }

  object api {
    val paginationMaximumSize: Int = conf.get[Int]("cumulus.api.paginationMaximumSize")
    val paginationDefaultSize: Int = conf.get[Int]("cumulus.api.paginationDefaultSize")
  }

  object storage {
    val chunkSize: Int = conf.get[Int]("cumulus.storage.chunkSize")
    val objectSize: Long = conf.get[Long]("cumulus.storage.objectSize")

    // List of supported ciphers
    val ciphers: Ciphers =
      Ciphers(
        AESCipherStage
      )

    // List of supported compressors
    val compressors: Compressions =
      Compressions(
        GzipStage,
        DeflateStage
      )

  }

}

sealed trait AppEnv
object Dev extends AppEnv
object Prod extends AppEnv

