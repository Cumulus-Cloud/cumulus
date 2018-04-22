package io.cumulus.controllers

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps

import akka.actor.Scheduler
import io.cumulus.CumulusWatchdog
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.validation.AppError
import io.cumulus.models.UserSession
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}

/**
  * Controller for all the operations on the server's own management.
  */
class ManagementController(
  cc: ControllerComponents,
  scheduler: Scheduler
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with BodyParserJson {

  /**
    * Reload programmatically the server. This will stop then restart the server, reloading everything on the server.
    * During the reload the server won't be able to respond to queries.
    */
  def reload = AuthenticatedAction { implicit request =>
    ApiResponse {
      if (request.user.isAdmin) {
        logger.info("Requesting the reloading of the Cumulus server")

        akka.pattern.after(2 seconds, scheduler)(Future {
          CumulusWatchdog.reload()
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
      if (request.user.isAdmin) {
        logger.info("Requesting the stopping of the Cumulus server")

        akka.pattern.after(2 seconds, scheduler)(Future {
          CumulusWatchdog.stop()
        })

        Right(Json.obj("message" -> request2Messages(request)("api-action.stop")))
      } else {
        AppError.unauthorized("api-error.forbidden")
      }
    }
  }

}
