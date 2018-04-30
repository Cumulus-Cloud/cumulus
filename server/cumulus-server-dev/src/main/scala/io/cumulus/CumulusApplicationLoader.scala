package io.cumulus

import io.cumulus.core.utils.ServerWatchdog
import play.api._

class CumulusApplicationLoader extends ApplicationLoader {
  def load(context: ApplicationLoader.Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }
    new CumulusComponents(context, new ServerWatchdog {

      def start(): Unit = {}

      def stop(): Unit = {}

      def reload(): Unit = {}

    }).application
  }
}
