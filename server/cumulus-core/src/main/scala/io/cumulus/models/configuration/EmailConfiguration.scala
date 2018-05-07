package io.cumulus.models.configuration
import play.api.Configuration
import play.api.libs.json.{Format, Json}

case class EmailConfiguration(
  host: String,
  port: Int,
  ssl: Boolean,
  tls: Boolean,
  tlsRequired: Boolean,
  user: Option[String],
  password: Option[String]
) extends ConfigurationEntries {

  def toPlayConfiguration: Configuration =
    Configuration(
      EmailConfiguration.hostKey        -> host,
      EmailConfiguration.portKey        -> port,
      EmailConfiguration.sslKey         -> ssl,
      EmailConfiguration.tlsKey         -> tls,
      EmailConfiguration.tlsRequiredKey -> tlsRequired,
      EmailConfiguration.userKey        -> user,
      EmailConfiguration.passwordKey    -> password,
      )

}

object EmailConfiguration {

  private val prefix = "play.mailer"

  private val hostKey        = s"$prefix.host"
  private val portKey        = s"$prefix.port"
  private val sslKey         = s"$prefix.ssl"
  private val tlsKey         = s"$prefix.tls"
  private val tlsRequiredKey = s"$prefix.tlsRequired"
  private val userKey        = s"$prefix.user"
  private val passwordKey    = s"$prefix.password"

  implicit val format: Format[EmailConfiguration] =
    Json.format[EmailConfiguration]

}
