package io.cumulus

import scala.util.{Failure, Success, Try}

import io.cumulus.core.Logging
import io.cumulus.core.validation.AppError
import play.core.server.{Server, ServerComponents}

/**
  * Global object used to manage the global state of the server. Used to manually hot-reload the server, after
  * for example a configuration change.
  */
object CumulusWatchdog extends Logging {

  private var server: Option[Server] = None

  private def createServer: ServerComponents = {
    new CumulusServer()
  }

  private def createRecoveryServer(error: Throwable): ServerComponents = {
    new CumulusRecoveryServer(error)
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

  /** Start the web server is not already started. */
  def start(): Unit = {
    if(server.isEmpty) {
      logger.info("Starting the Cumulus web server...")
      Try {
        internalStart()
      } match {
        case Success(_) =>
          logger.info("Cumulus web server successfully started")
        case Failure(error) =>
          logger.warn("Cumulus web server failed to start", error)
          internalStartRecoveryServer(error)
      }
      logger.info("Cumulus web server successfully started")
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

    internalStart()
    logger.info("Cumulus web server successfully reloaded")
  }

}
