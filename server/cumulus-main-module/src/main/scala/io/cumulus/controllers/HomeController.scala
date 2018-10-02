package io.cumulus.controllers

import io.cumulus.controllers.utils.UserAuthentication
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.persistence.query.QueryPagination
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
  settings: Settings
) extends AbstractController(cc) with UserAuthentication with ApiUtils {

  val index: Action[AnyContent] = AuthenticatedAction.withErrorHandler { implicit request =>

    val user = request.authenticatedSession.user

    Ok(IndexPage(Some(user), None))

  } { implicit request =>
    Ok(IndexPage(None, None))
  }

  def indexWithPath(path: String): Action[AnyContent] = AuthenticatedAction.asyncWithErrorHandler { implicit request =>

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
        case NonFatal(e) =>
          IndexPage(Some(user), None)
      }
      .map(Ok(_))

  } { implicit request =>
    Future.successful(Ok(IndexPage(None, None)))
  }

  def indexWithIgnoredPath(path: String): Action[AnyContent] = AuthenticatedAction.withErrorHandler { implicit request =>

    val user = request.authenticatedSession.user

    Ok(IndexPage(Some(user), None))

  } { implicit request =>
    Ok(IndexPage(None, None))
  }

}
