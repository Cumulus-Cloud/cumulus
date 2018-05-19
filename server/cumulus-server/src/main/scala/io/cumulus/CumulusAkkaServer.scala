package io.cumulus

import play.api.{Configuration, Environment, Mode}
import play.core.server.{AkkaHttpServerComponents, ServerConfig}

/**
  * Common trait used to define an embed cumulus server with Akka HTTP as the backend.
  */
trait CumulusAkkaServer extends AkkaHttpServerComponents {

  val env: Environment = Environment.simple()

  val port: Int       = Configuration.load(env).get[Int]("play.http.port")
  val address: String = Configuration.load(env).get[String]("play.http.address")
  val modeRaw: String = Configuration.load(env).get[String]("play.http.mode")

  val mode: Mode =
    modeRaw.toUpperCase match {
      case "DEV"  => Mode.Dev
      case "TEST" => Mode.Test
      case "PROD" => Mode.Prod
      case _      => throw new Exception(s"Invalid mode type '$modeRaw' ; can only be 'DEV', 'TEST' or 'PROD'")
    }

  override lazy val serverConfig =
    ServerConfig(
      port = Some(port),
      mode = mode,
      address = address
    )

}

