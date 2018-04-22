package io.cumulus

import _root_.controllers.AssetsComponents
import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
import com.softwaremill.macwire.wire
import io.cumulus.controllers.utils.LoggingFilter
import io.cumulus.core.controllers.utils.api.{ApiUtils, HttpErrorHandler}
import io.cumulus.core.validation.AppError
import jsmessages.{JsMessages, JsMessagesFactory}
import play.api
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.mvc.{EssentialFilter, Results}
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
    case GET(p"/hello/$to") => Action {
      Results.Ok(s"Hello $to")
    }
    case GET(p"/$path*") => Action {
      println(path)
      // TODO show error within a twirl page
      Results.Ok(error.getStackTrace.map(_.toString).mkString("\n"))
    }
    // TODO add reload commands
  }

  // Override messagesApi to use Hocon config
  override implicit lazy val messagesApi: MessagesApi = wire[HoconMessagesApiProvider].get
  lazy val jsMessages: JsMessages                     = wire[JsMessagesFactory].all

  // HTTP components
  lazy val loggingFilter: LoggingFilter                = wire[LoggingFilter]
  override lazy val httpFilters: Seq[EssentialFilter]  = Seq(loggingFilter)
  override lazy val httpErrorHandler: HttpErrorHandler = wire[HttpErrorHandler]

}