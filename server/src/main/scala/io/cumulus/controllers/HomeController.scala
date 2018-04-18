package io.cumulus.controllers

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps

import akka.actor.Scheduler
import io.cumulus.CumulusWatchdog
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.UserSession
import play.api.libs.json.Json
import play.api.mvc._


class HomeController (
  cc: ControllerComponents,
  scheduler: Scheduler
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with BodyParserJson {

  def index = Action {
    //Ok(io.cumulus.views.html.index())
    Ok("ok")
  }

  def testLogin = Action {
    //Ok(io.cumulus.views.html.test.login())
    Ok("ok")
  }

  def test = AuthenticatedAction.withErrorHandler { implicit request =>
    //Ok(io.cumulus.views.html.test.index())
    Ok("ok")
  } { _: Request[_] =>
    Future.successful(Redirect(routes.HomeController.testLogin()))
  }

  def reload = Action { implicit request =>
    // TODO check connected + admin
    logger.info("Requesting the reloading of the Cumulus server")

    akka.pattern.after(5 seconds, scheduler)(Future {
      CumulusWatchdog.reload()
    })

    Ok(Json.obj("message" -> request2Messages(request)("api-action.reload")))
  }

  def stop = Action { implicit request =>
    // TODO check connected + admin
    logger.info("Requesting the stopping of the Cumulus server")

    akka.pattern.after(5 seconds, scheduler)(Future {
      CumulusWatchdog.stop()
    })

    Ok(Json.obj("message" -> request2Messages(request)("api-action.stop")))
  }

}
