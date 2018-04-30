package io.cumulus

import play.api
import play.api.{ApplicationLoader, LoggerConfigurator}
import io.cumulus.core.utils.ServerWatchdog

class CumulusRecoveryServer(error: Throwable, watchdog: ServerWatchdog) extends CumulusAkkaServer {

  val application: api.Application = {
    // Create the default context of the application
    val context: ApplicationLoader.Context = ApplicationLoader.createContext(env)

    // Init the logger
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    // Instantiate all the components of the application
    new CumulusRecoveryComponents(context, watchdog)(error).application
  }

}

