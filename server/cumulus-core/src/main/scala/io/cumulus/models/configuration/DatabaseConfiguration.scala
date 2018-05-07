package io.cumulus.models.configuration

import play.api.Configuration
import play.api.libs.json.{Format, Json}


case class DatabaseConfiguration(
  username: String,
  password: String,
  hostname: String,
  database: String,
  port: Option[String]
) extends ConfigurationEntries {

  def toPlayConfiguration: Configuration =
    Configuration(
      DatabaseConfiguration.usernameKey -> username,
      DatabaseConfiguration.passwordKey -> password,
      DatabaseConfiguration.urlKey -> s"jdbc:postgresql://$hostname:${port.getOrElse("5432")}/$database"
    )

}

object DatabaseConfiguration {

  private val prefix = "db.default"

  private val usernameKey = s"$prefix.username"
  private val passwordKey = s"$prefix.password"
  private val urlKey      = s"$prefix.url"

  implicit val format: Format[DatabaseConfiguration] =
    Json.format[DatabaseConfiguration]

}
