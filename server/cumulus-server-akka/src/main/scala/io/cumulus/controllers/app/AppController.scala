package io.cumulus.controllers.app

import akka.http.scaladsl.server.Directives.{path, _}
import akka.http.scaladsl.server.{RejectionHandler, Route}
import io.cumulus.i18n.Messages
import io.cumulus.models.fs.FsNodeType
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.persistence.stores.orderings.FsNodeOrdering
import io.cumulus.services.FsNodeService
import io.cumulus.validation.AppErrorType.Unauthorized
import io.cumulus.controllers.app.views.IndexPage
import io.cumulus.{AppComponent, AppErrorRejection, Authenticator, ErrorSupport, RejectionSupport, Settings}
import play.api.mvc._

import scala.concurrent.ExecutionContext
import scala.util.control.NonFatal


class AppController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  val auth: Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends
  AppComponent with
  ErrorSupport with
  RejectionSupport {

  val customRejectionHandler: RejectionHandler =
    RejectionHandler.newBuilder().handle {
      case AppErrorRejection(appError) if appError.errorType == Unauthorized =>
        withContext { implicit ctx =>
          IndexPage(None, None).toResult
        }
    }.result().withFallback(rejectionHandler)

  val routes: Route =
    Route.seal(
      concat(
        index,
        indexWithPath,
        indexWithIgnoredPath
      )
    )(
      rejectionHandler = customRejectionHandler,
      exceptionHandler = exceptionHandler
    )

  def index: Route =
    (get & pathSingleSlash) {
      withAuthentication { implicit ctx =>
        IndexPage(Some(ctx.user), None).toResult
      }
    }

  def indexWithPath: Route =
    (get & path("app" / "fs" / CumulusPath)) { path =>
      withAuthentication { implicit ctx =>
        // Authenticated, show the app page with the connected user and the requested directory (if possible)
        fsNodeService
          .findNode(path)
          .map(_.toOption)
          .flatMap {
            // If the directory is a file, retrieve the content
            case Some(node) if node.nodeType == FsNodeType.DIRECTORY =>
              // TODO we could optimise that and render the error to the front
              fsNodeService.findContent(node.id, QueryPagination(50), FsNodeOrdering.default)
          }
          .map { maybeDirectory =>
            IndexPage(Some(ctx.user), maybeDirectory.toOption)
          }
          .recover {
            case NonFatal(_) =>
              IndexPage(Some(ctx.user), None)
          }
          .toResult
      }
    }

  def indexWithIgnoredPath: Route =
    (get & path(RemainingPath)) { _ =>
      withAuthentication { implicit ctx =>
        // Authenticated, show the app page with the connected user
        IndexPage(Some(ctx.user), None).toResult
      }
    }

}
