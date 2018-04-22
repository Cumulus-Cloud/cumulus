package io.cumulus

import scala.concurrent.ExecutionContextExecutor

import _root_.controllers.AssetsComponents
import akka.actor.Scheduler
import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
import com.softwaremill.macwire._
import io.cumulus.controllers.RecoveryController
import io.cumulus.controllers.utils.{Assets, LoggingFilter}
import io.cumulus.core.controllers.utils.api.{ApiUtils, HttpErrorHandler}
import jsmessages.{JsMessages, JsMessagesFactory}
import play.api
import play.api.i18n.MessagesApi
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.routing.sird._
import play.api.{ApplicationLoader, BuiltInComponentsFromContext, LoggerConfigurator}

class CumulusRecoveryServer(error: Throwable) extends CumulusAkkaServer {

  val application: api.Application = {
    // Create the default context of the application
    val context: ApplicationLoader.Context = ApplicationLoader.createContext(env)

    // Init the logger
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    // Instantiate all the components of the application
    new CumulusRecoveryComponents(context)(error).application
  }

}

class CumulusRecoveryComponents(
  context: ApplicationLoader.Context
)(
  error: Throwable
) extends BuiltInComponentsFromContext(context)
  with HoconI18nComponents
  with AssetsComponents
  with ApiUtils {

  lazy val router = Router.from {
    case GET(p"/api/admin/management/reload") =>
      controller.reload
    case GET(p"/api/admin/management/stop") =>
      controller.stop
    case GET(p"/assets/$file*") =>
      assetController.versioned(path = "/src/main/resources/public", file)
    case GET(p"/$path*") =>
      controller.index
  }

  // Override messagesApi to use Hocon config
  override implicit lazy val messagesApi: MessagesApi = wire[HoconMessagesApiProvider].get
  lazy val jsMessages: JsMessages                     = wire[JsMessagesFactory].all

  // Execution contexts
  implicit lazy val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  lazy val scheduler: Scheduler                         = actorSystem.scheduler

  // HTTP components
  lazy val loggingFilter: LoggingFilter                = wire[LoggingFilter]
  override lazy val httpFilters: Seq[EssentialFilter]  = Seq(loggingFilter)
  override lazy val httpErrorHandler: HttpErrorHandler = wire[HttpErrorHandler]

  // Controllers
  lazy val controller: RecoveryController = wire[RecoveryController]
  lazy val assetController: Assets        = wire[Assets]


}