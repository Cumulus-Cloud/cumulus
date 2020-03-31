package io.cumulus.controllers.api

import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._
import io.cumulus.controllers.api.admin.UserAdminController
import io.cumulus.{ApiComponent, Authenticator, ErrorSupport, RejectionSupport, Settings}
import io.cumulus.i18n.Messages
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}

import scala.concurrent.ExecutionContext

/** Main controller of the api. */
class ApiController (
  fileSystemController: FileSystemController,
  sharingController: SharingController,
  sharingPublicController: SharingPublicController,
  userController: UserController,
  userAdminController: UserAdminController,
  val auth: Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends
  ApiComponent with
  ErrorSupport with
  RejectionSupport {

  val routes: Route =
      pathPrefixTest("api") {
        // Api own error & rejection handling (if we start with '/api')
        Route.seal(
          concat(
            fileSystemController.routes,
            sharingController.routes,
            sharingPublicController.routes,
            userController.routes,
            userAdminController.routes,
          )
        )(
          rejectionHandler = rejectionHandler,
          exceptionHandler = exceptionHandler
        )
      }

}