package io.cumulus

import scala.util.{Failure, Success, Try}

import io.cumulus.core.Logging
import io.cumulus.core.utils.ServerWatchdog
import play.core.server.{Server, ServerComponents}

/**
  * Global object used to manage the global state of the server. Used to manually hot-reload the server, after
  * for example a configuration change.
  */
object CumulusWatchdog extends ServerWatchdog with Logging {

  // TODO load some conf to see if the server needs configuration or not

  private var server: Option[Server] = None

  private def createServer: ServerComponents = {
    new CumulusServer(this)
  }

  private def createRecoveryServer(error: Throwable): ServerComponents = {
    new CumulusRecoveryServer(error, this)
  }

  private def createInstallationServer: ServerComponents = {
    new CumulusInstallationServer(this)
  }

  private def internalStart(): Unit = {
    server = Some(createServer.server)
  }

  private def internalStop(): Unit = {
    server.foreach(_.stop())
    server = None
  }

  private def internalStartRecoveryServer(error: Throwable): Unit = {
    server = Some(createRecoveryServer(error).server)
  }

  private def internalStartInstallationServer: Unit = {
    server = Some(createInstallationServer.server)
  }

  /** Start the web server if not already started. */
  def start(): Unit = {
    if(server.isEmpty) {
      logger.info("Starting the Cumulus web server...")
      Try {
        // TODO start installation if needed
        internalStart()
      } match {
        case Success(_) =>
          logger.info("Cumulus web server successfully started")
        case Failure(error) =>
          logger.warn("Cumulus web server failed to start", error)
          internalStartRecoveryServer(error)
      }
    } else
      logger.info("Cumulus web server already started")

    ()
  }

  /** Stop the web server if not already stopped. */
  def stop(): Unit = {
    if(server.nonEmpty) {
      logger.info("Stopping the Cumulus server...")
      internalStop()
      logger.info("Cumulus web server successfully stopped")
    } else
      logger.info("Cumulus web server already stopped")

    ()
  }

  /** Reload the web server or start it if not already running. */
  def reload(): Unit = {
    logger.info("Reloading the Cumulus server...")
    if(server.isDefined)
      internalStop()

    Try {
      // TODO start installation if needed
      internalStart()
    } match {
      case Success(_) =>
        logger.info("Cumulus web server successfully reloaded")
      case Failure(error) =>
        logger.warn("Cumulus web server failed to reload", error)
        internalStartRecoveryServer(error)
    }
  }

}
