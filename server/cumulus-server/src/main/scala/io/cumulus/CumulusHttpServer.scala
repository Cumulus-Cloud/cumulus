package io.cumulus

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives.concat
import akka.http.scaladsl.server.Route
import akka.stream.Materializer
import akka.util.Timeout
import com.softwaremill.macwire.wire
import io.cumulus.controllers.api._
import io.cumulus.controllers.api.admin._
import io.cumulus.controllers.app.AppController
import io.cumulus.controllers.utils.{AssetController, Authenticator, RouteLogger, UserAuthenticator}
import io.cumulus.i18n.Messages
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.persistence.query.QueryRunner
import io.cumulus.persistence.storage.StorageEngines
import io.cumulus.services._
import io.cumulus.services.admin._
import io.cumulus.utils.Logging

import scala.concurrent.{ExecutionContext, Future}


class CumulusHttpServer(
  userService: UserService,
  fsNodeService: FsNodeService,
  storageService: StorageService,
  sharingService: SharingService,
  sessionService: SessionService,
  eventService: EventService,
  taskService: TaskService,
  mailService: MailService,
  tokenService: TokenService[AuthenticationToken],
  userServiceAdmin: UserAdminService,
  storageEngines: StorageEngines,
)(
  implicit
  ec: ExecutionContext,
  m: Materializer,
  actorSystem: ActorSystem,
  queryRunner: QueryRunner[Future],
  settings: Settings,
  messages: Messages
) extends Logging {

  lazy val authenticator: Authenticator[AuthenticationToken, UserSession] = wire[UserAuthenticator]

  // Controllers
  lazy val fileSystemController: FileSystemController       = wire[FileSystemController]
  lazy val sharingController: SharingController             = wire[SharingController]
  lazy val sharingPublicController: SharingPublicController = wire[SharingPublicController]
  lazy val userController: UserController                   = wire[UserController]
  lazy val userAdminController: UserAdminController         = wire[UserAdminController]

  // Main controllers
  lazy val apiController: ApiController     = wire[ApiController]   // All api-related call, starting with 'api/'
  lazy val assetController: AssetController = wire[AssetController] // All assets call, starting with 'assets/'
  lazy val appController: AppController     = wire[AppController]   // All other routes

  // Create the main route handler from the controllers
  lazy val routes: Route =
    RouteLogger.log(
      level = "info",
      concat(
        assetController.routes,
        apiController.routes,
        appController.routes // Catch-all
      )
    )

  private implicit val akkaTimeout: Timeout =
    settings.http.timeout

  /** Starts the server using the provided information. */
  def startServer(): Future[Http.ServerBinding] = {
    logger.info("Initializing web server...")
    Http().bindAndHandle(
      interface = settings.http.hostname,
      port = settings.http.port,
      handler = routes
    )
  }

}
