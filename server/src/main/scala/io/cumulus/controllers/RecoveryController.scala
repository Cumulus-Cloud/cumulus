package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.language.postfixOps

import akka.actor.Scheduler
import io.cumulus.CumulusWatchdog
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}

/**
  * Controller only used if the server failed to start, providing operations ont the server's configuration and
  * lifecycle to try to fix what prevented the server from starting.
  */
class RecoveryController(
  error: Throwable,
  cc: ControllerComponents,
  scheduler: Scheduler
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with BodyParserJson {

  def index = Action {
    Ok(io.cumulus.views.html.recoveryIndex(error))
  }

  /**
    * Reload programmatically the server. This will stop then restart the server, reloading everything on the server.
    * During the reload the server won't be able to respond to queries.
    */
  def reload = Action { implicit request =>
    ApiResponse {
      logger.info("Requesting the reloading of the Cumulus server")

      akka.pattern.after(2 seconds, scheduler)(Future {
        CumulusWatchdog.reload()
      })

      Right(Json.obj("message" -> request2Messages(request)("api-action.reload")))
    }
  }

  /**
    * Stops programmatically the server. This will stop the server from responding and ends the process. After this,
    * the server will need to be manually restarted.
    */
  def stop = Action { implicit request =>
    ApiResponse {
      logger.info("Requesting the stopping of the Cumulus server")

      akka.pattern.after(2 seconds, scheduler)(Future {
        CumulusWatchdog.stop()
      })

      Right(Json.obj("message" -> request2Messages(request)("api-action.stop")))
    }
  }

}
