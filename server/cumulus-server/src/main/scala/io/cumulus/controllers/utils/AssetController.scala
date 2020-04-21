package io.cumulus.controllers.utils

import akka.http.scaladsl.server.Directives.{path, _}
import akka.http.scaladsl.server.Route
import io.cumulus.Settings
import io.cumulus.i18n.Messages
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}

import scala.concurrent.ExecutionContext

class AssetController(
  val auth: Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
)  extends
  AppComponent with
  ErrorSupport with
  RejectionSupport {

  val routes: Route =
    concat(
      path("favicon.ico") {
        getFromFile("favicon.ico")
      },
      pathPrefix("assets") {
        Route.seal(
          getFromResourceDirectory("public")
          // TODO messages ?
          // TODO error handler ? 404 file ?
        )(
          rejectionHandler = rejectionHandler,
          exceptionHandler = exceptionHandler
        )
      }
    )

}
