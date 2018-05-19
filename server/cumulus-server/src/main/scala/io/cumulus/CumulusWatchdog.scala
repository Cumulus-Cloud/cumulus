package io.cumulus

import io.cumulus.core.utils.ServerWatchdog
import io.cumulus.core.{Logging, Settings}
import play.api.{Configuration, Environment}
import play.core.server.Server

import scala.util.{Failure, Success, Try}

/**
  * Global object used to manage the global state of the server. Used to manually hot-reload the server, after
  * for example a configuration change.
  */
object CumulusWatchdog extends ServerWatchdog with Logging {

  /** Starts the web server (if it is not already started). Use `reload` to reload the server. */
  def start(): Unit = {
    if(server.isEmpty)
      startServer()
    else
      logger.info("Cumulus web server already started")

    ()
  }

  /** Reloads the web server (or starts if it is not already running). */
  def reload(): Unit = {
    logger.info("Reloading the Cumulus server...")

    if(server.isDefined)
      stopServer()

    startServer()

    ()
  }

  /** Stops the web server (if it is not already stopped). */
  def stop(): Unit = {
    if(server.nonEmpty) {
      logger.info("Stopping the Cumulus server...")
      stopServer()
      logger.info("Cumulus web server successfully stopped")
    } else
      logger.info("Cumulus web server already stopped")

    ()
  }

  /** The currently running server, as a var because it will be updated each time the server is reloaded */
  private var server: Option[Server] = None

  /** The environment is needed to the configuration. */
  private val env: Environment =
    Environment.simple()

  /** The initial configuration. */
  private val initialConfiguration: Configuration =
    Configuration.load(env)

  /** The configuration. Not a val, because we want to reload the configuration at each call. */
  private def settings: Settings =
    new Settings(initialConfiguration)

  /** Starts the main server. */
  private def startMainServer(): Unit = {
    val newServerInstance = new CumulusServer(this)
    server = Some(newServerInstance.server)
  }

  /** Starts the recovery server. */
  private def startRecoveryServer(error: Throwable): Unit = {
    val newServerInstance = new CumulusRecoveryServer(error, this)
    server = Some(newServerInstance.server)
  }

  /** Starts the installation server. */
  private def startInstallationServer(): Unit = {
    val newServerInstance = new CumulusInstallationServer(this)
    server = Some(newServerInstance.server)
  }

  /** Starts the server. This method will ignore any server already running. */
  private def startServer(): Unit = {
    Try {
      if (settings.management.installation) {
        logger.info("Starting the Cumulus installation server...")
        startInstallationServer()
      } else {
        logger.info("Starting the Cumulus web server...")
        startMainServer()
      }
    } match {
      case Success(_) =>
        logger.info("Cumulus web server successfully started")
      case Failure(error) =>
        if(settings.management.allowRecovery) {
          logger.warn("Cumulus web server failed to start", error)
          startRecoveryServer(error)
        } else {
          logger.error("Cumulus web server failed to start. Stopping the application...", error)
        }
    }

    ()
  }

  /** Stops the currently running server. */
  private def stopServer(): Unit = {
    server.foreach(_.stop())
    server = None
  }

}
