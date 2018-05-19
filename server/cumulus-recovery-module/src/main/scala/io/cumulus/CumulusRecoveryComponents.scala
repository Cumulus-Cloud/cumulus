package io.cumulus

import java.io.File
import java.security.Security
import scala.concurrent.ExecutionContextExecutor

import _root_.controllers.AssetsComponents
import akka.actor.Scheduler
import com.github.ghik.silencer.silent
import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
import com.softwaremill.macwire._
import com.typesafe.config.ConfigFactory
import io.cumulus.controllers.RecoveryController
import io.cumulus.core.Settings
import io.cumulus.core.controllers.Assets
import io.cumulus.core.controllers.utils.LoggingFilter
import io.cumulus.core.controllers.utils.api.{ApiUtils, HttpErrorHandler}
import io.cumulus.core.utils.ServerWatchdog
import io.cumulus.persistence.services.ConfigurationService
import jsmessages.{JsMessages, JsMessagesFactory}
import org.bouncycastle.jce.provider.BouncyCastleProvider
import play.api.i18n.MessagesApi
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.routing.sird._
import play.api.{ApplicationLoader, BuiltInComponentsFromContext, Configuration}


class CumulusRecoveryComponents(
  context: ApplicationLoader.Context,
  watchdog: ServerWatchdog
)(
  error: Throwable
) extends BuiltInComponentsFromContext(context)
  with HoconI18nComponents
  with AssetsComponents
  with ApiUtils {

  // Security provider
  Security.addProvider(new BouncyCastleProvider)

  // Routes
  lazy val router = Router.from {
    case GET(p"/api/admin/management/reload") =>
      controller.reload
    case GET(p"/api/admin/management/stop") =>
      controller.stop
    case GET(p"/assets/$file*") =>
      assetController.versioned(file)
    case GET(p"/$path*") =>
      path: @silent
      controller.index
  }

  override implicit lazy val configuration: Configuration =
    context.initialConfiguration ++
      Configuration(ConfigFactory.parseFile(new File(context.initialConfiguration.get[String]("cumulus.configuration.path"))))

  implicit lazy val settings: Settings = wire[Settings]

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

  // Services
  lazy val configurationService: ConfigurationService = wire[ConfigurationService]

  // Controllers
  lazy val controller: RecoveryController = wire[RecoveryController]
  lazy val assetController: Assets        = wire[Assets]

}