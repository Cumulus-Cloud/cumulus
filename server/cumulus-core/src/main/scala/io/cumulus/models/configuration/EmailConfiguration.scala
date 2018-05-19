package io.cumulus.models.configuration

import io.cumulus.models.configuration.EmailConfiguration._
import play.api.Configuration
import play.api.libs.json.{Format, Json}

case class EmailConfiguration(
  host: String,
  port: Int,
  ssl: Boolean,
  tls: Boolean,
  tlsRequired: Boolean,
  user: Option[String],
  password: Option[String],
  from: String
) extends ConfigurationEntries {

  def toPlayConfiguration: Configuration =
    Configuration(
      hostKey        -> host,
      portKey        -> port,
      sslKey         -> ssl,
      tlsKey         -> tls,
      tlsRequiredKey -> tlsRequired,
      userKey        -> user,
      passwordKey    -> password,
      fromKey        -> from
    )

}

object EmailConfiguration extends ConfigurationEntriesFactory[EmailConfiguration] {

  private val prefix = "play.mailer"

  private val hostKey        = s"$prefix.host"
  private val portKey        = s"$prefix.port"
  private val sslKey         = s"$prefix.ssl"
  private val tlsKey         = s"$prefix.tls"
  private val tlsRequiredKey = s"$prefix.tlsRequired"
  private val userKey        = s"$prefix.user"
  private val passwordKey    = s"$prefix.password"
  private val fromKey        = "cumulus.mail.from"

  implicit val format: Format[EmailConfiguration] =
    Json.format[EmailConfiguration]

  def fromPlayConfiguration(configuration: Configuration): EmailConfiguration = {
    val host =
      configuration
        .getOptional[String](hostKey)
        .getOrElse("")

    val port =
      configuration
        .getOptional[Int](portKey)
        .getOrElse(25)

    val ssl =
      configuration
        .getOptional[Boolean](sslKey)
        .getOrElse(false)

    val tls =
      configuration
        .getOptional[Boolean](tlsKey)
        .getOrElse(false)

    val tlsRequired =
      configuration
        .getOptional[Boolean](tlsRequiredKey)
        .getOrElse(false)

    val user =
      configuration
        .getOptional[String](userKey)

    val password =
      configuration
        .getOptional[String](passwordKey)

    val from =
      configuration
          .getOptional[String](fromKey)
          .getOrElse("")

    EmailConfiguration(
      host,
      port,
      ssl,
      tls,
      tlsRequired,
      user,
      password,
      from
    )
  }

}
