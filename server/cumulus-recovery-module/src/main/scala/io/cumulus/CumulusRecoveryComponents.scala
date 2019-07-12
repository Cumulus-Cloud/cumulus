package io.cumulus

import java.security.Security

import _root_.controllers.AssetsComponents
import akka.actor.Scheduler
import com.github.ghik.silencer.silent
import com.softwaremill.macwire._
import io.cumulus.controllers.utils.LoggingFilter
import io.cumulus.controllers.{Assets, RecoveryController}
import io.cumulus.core.controllers.utils.api.{ApiUtils, HttpErrorHandler}
import io.cumulus.core.utils.ServerWatchdog
import jsmessages.{JsMessages, JsMessagesFactory}
import org.bouncycastle.jce.provider.BouncyCastleProvider
import play.api.i18n.{I18nComponents, MessagesApi}
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.routing.sird._
import play.api.{ApplicationLoader, BuiltInComponentsFromContext}

import scala.concurrent.ExecutionContextExecutor


class CumulusRecoveryComponents(
  context: ApplicationLoader.Context,
  watchdog: ServerWatchdog
)(
  error: Throwable
) extends BuiltInComponentsFromContext(context)
  with I18nComponents
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

  // Implicit message + JS messages
  implicit lazy val implicitMessagesApi: MessagesApi = messagesApi
  lazy val jsMessages: JsMessages = wire[JsMessagesFactory].all

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