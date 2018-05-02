package io.cumulus

import io.cumulus.core.utils.ServerWatchdog
import play.api._

/** Play loader. Used only in dev, to be able to use Play's hot reload. */
class CumulusApplicationLoader extends ApplicationLoader {
  def load(context: ApplicationLoader.Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }
    new CumulusComponents(context, NotAvailableWatchdog).application
  }
}

/** The watchdog is not available when the server is started through Play. */
object NotAvailableWatchdog extends ServerWatchdog {

  private val error =
    "The watchdog is not available when the application is started through Play's SBT plugin. " +
      "Use the embed server (sbt run) to be able to control the server's lifecycle."

  def start(): Unit =
    throw new Exception(error)

  def stop(): Unit =
    throw new Exception(error)

  def reload(): Unit =
    throw new Exception(error)

}