package io.cumulus

import io.cumulus.core.utils.ServerWatchdog
import play.api
import play.api.{ApplicationLoader, LoggerConfigurator}

class CumulusInstallationServer(watchdog: ServerWatchdog) extends CumulusAkkaServer {

  val application: api.Application = {
    // Create the default context of the application
    val context: ApplicationLoader.Context = ApplicationLoader.createContext(env)

    // Init the logger
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    // Instantiate all the components of the application
    new CumulusInstallationComponents(context, watchdog).application
  }

}

