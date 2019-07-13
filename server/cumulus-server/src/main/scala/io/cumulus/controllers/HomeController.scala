package io.cumulus.controllers

import com.github.ghik.silencer.silent
import io.cumulus.Settings
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.models.fs.FsNodeType
import io.cumulus.persistence.stores.orderings.FsNodeOrdering
import io.cumulus.services.{FsNodeService, SessionService}
import io.cumulus.views.IndexPage
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal


class HomeController(
  cc: ControllerComponents,
  fsNodeService: FsNodeService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  val settings: Settings
) extends Api(cc) {

  private def showIndex: ErrorHandlerAsync = { implicit request: Request[_] =>
    // Not authenticated, show the app page
    Future.successful(Ok(IndexPage(None, None)))
  }

  val index: Action[AnyContent] =
    AuthenticatedActionWith(errorHandler = showIndex) { implicit request =>
      // Authenticated, show the app page with the connected user
      Ok(IndexPage(Some(request.authenticatedSession.user), None))
    }

  def indexWithPath(path: String): Action[AnyContent] =
    AuthenticatedActionWith(errorHandler = showIndex).async { implicit request =>
      // Authenticated, show the app page with the connected user and the requested directory (if possible)
      val user = request.authenticatedSession.user

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
          IndexPage(Some(user), maybeDirectory.toOption)
        }
        .recover {
          case NonFatal(_) =>
            IndexPage(Some(user), None)
        }
        .map(Ok(_))

    }

  def indexWithIgnoredPath(path: String): Action[AnyContent] =
    AuthenticatedActionWith(errorHandler = showIndex) { implicit request =>
      // Authenticated, show the app page with the connected user
      path: @silent
      val user = request.authenticatedSession.user

      Ok(IndexPage(Some(user), None))
    }

}
