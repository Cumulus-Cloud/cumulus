package io.cumulus.controllers.admin

import akka.actor.Scheduler
import io.cumulus.controllers.utils.UserAuthenticationSupport
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.utils.ServerWatchdog
import io.cumulus.core.validation.AppError
import io.cumulus.services.SessionService
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps

/**
  * Controller for all the operations on the server's own management.
  */
class ManagementController(
  watchdog: ServerWatchdog,
  cc: ControllerComponents,
  scheduler: Scheduler,
  val sessionService: SessionService
)(
  implicit val ec: ExecutionContext
) extends AbstractController(cc) with UserAuthenticationSupport with ApiUtils with BodyParserJson {

  /**
    * Reload programmatically the server. This will stop then restart the server, reloading everything on the server.
    * During the reload the server won't be able to respond to queries.
    */
  def reload = AuthenticatedAction { implicit request =>
    ApiResponse {
      if (request.authenticatedSession.user.isAdmin) {
        logger.info("Requesting the reloading of the Cumulus server")

        akka.pattern.after(2 seconds, scheduler)(Future {
          watchdog.reload()
        })

        Right(Json.obj("message" -> request2Messages(request)("api-action.reload")))
      } else {
        AppError.unauthorized("api-error.forbidden")
      }
    }
  }

  /**
    * Stops programmatically the server. This will stop the server from responding and ends the process. After this,
    * the server will need to be manually restarted.
    */
  def stop = AuthenticatedAction { implicit request =>
    ApiResponse {
      if (request.authenticatedSession.user.isAdmin) {
        logger.info("Requesting the stopping of the Cumulus server")

        akka.pattern.after(2 seconds, scheduler)(Future {
          watchdog.stop()
        })

        Right(Json.obj("message" -> request2Messages(request)("api-action.stop")))
      } else {
        AppError.unauthorized("api-error.forbidden")
      }
    }
  }

}
