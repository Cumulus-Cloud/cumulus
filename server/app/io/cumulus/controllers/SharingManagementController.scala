package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.models.{Path, UserSession}
import io.cumulus.persistence.services.SharingService
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

/**
  * Sharing controller. This controller handle all the authenticated operation on shared elements.
  */
class SharingManagementController(
  cc: ControllerComponents,
  sharingService: SharingService
)(implicit
  ec: ExecutionContext,
  settings: Settings
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils {

  /**
    * Lists all sharings of the authenticated user.
    * @param limit The maximum number of sharings to return. Used for pagination.
    * @param offset The offset of elements to return. Used for pagination.
    */
  def all(limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse.paginated {
        val pagination = QueryPagination(limit, offset)
        sharingService.listAllSharings(pagination)
      }
    }

  /**
    * Lists all sharings on the `path` node of the authenticated user.
    * @param path The path of the node.
    */
  def list(path: Path, limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse.paginated {
        val pagination = QueryPagination(limit, offset)

        sharingService.listSharings(path, pagination)
      }
    }

  /**
    * Gets a sharing by its reference.
    * @param reference The reference of the sharing.
    */
  def get(reference: String): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        sharingService.findSharing(reference)
      }
    }

  /**
    * Deletes a sharing by its reference.
    * @param reference The reference of the sharing to delete.
    */
  def delete(reference: String): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        sharingService.deleteSharing(reference)
      }
    }

}
