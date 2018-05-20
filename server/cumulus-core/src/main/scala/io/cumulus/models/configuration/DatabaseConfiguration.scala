package io.cumulus.models.configuration

import io.cumulus.models.configuration.DatabaseConfiguration._
import play.api.Configuration
import play.api.libs.json.{Format, Json}

case class DatabaseConfiguration(
  username: String,
  password: String,
  hostname: String,
  database: String,
  port: Option[Int]
) extends ConfigurationEntries {

  def toPlayConfiguration: Configuration =
    Configuration(
      usernameKey -> username,
      passwordKey -> password,
      urlKey      -> s"jdbc:postgresql://$hostname:${port.getOrElse("5432")}/$database"
    )

}

object DatabaseConfiguration extends ConfigurationEntriesFactory[DatabaseConfiguration] {

  private val prefix = "db.default"

  private val usernameKey = s"$prefix.username"
  private val passwordKey = s"$prefix.password"
  private val urlKey      = s"$prefix.url"

  implicit val format: Format[DatabaseConfiguration] =
    Json.format[DatabaseConfiguration]

  def fromPlayConfiguration(configuration: Configuration): DatabaseConfiguration = {
    val username =
      configuration
        .getOptional[String](usernameKey)
        .getOrElse("")

    val password =
      configuration
        .getOptional[String](passwordKey)
        .getOrElse("")

    val urlRegex = """jdbc:postgresql:\/\/([^:]+)(?::(\d+))?\/(.+)""".r

    val url =
      configuration
        .getOptional[String](urlKey)
        .getOrElse("")

    val (hostname, port, database) =
      urlRegex
        .findFirstMatchIn(url)
        .map { m =>
          (m.group(1), Option(m.group(2).toInt), m.group(3))
        }
        .getOrElse(("", None, ""))

    DatabaseConfiguration(
      username,
      password,
      hostname,
      database,
      port
    )
  }

}
