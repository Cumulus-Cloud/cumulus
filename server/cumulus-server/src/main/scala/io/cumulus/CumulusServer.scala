package io.cumulus

import play.api._
import io.cumulus.core.utils.ServerWatchdog

/**
  * Create an embed (programmatically managed) play server using the Cumulus web app components and a default context.
  */
class CumulusServer(watchdog: ServerWatchdog) extends CumulusAkkaServer {

  val application: Application = {
    // Create the default context of the application
    val context: ApplicationLoader.Context = ApplicationLoader.createContext(env)

    // Init the logger
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    // Instantiate all the components of the application
    new CumulusComponents(context, watchdog).application
  }

}
