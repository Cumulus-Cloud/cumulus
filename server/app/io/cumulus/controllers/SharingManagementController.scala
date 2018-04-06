package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import io.cumulus.controllers.utils.FileDownloaderUtils
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.models.{Path, UserSession}
import io.cumulus.persistence.services.{SharingService, StorageService}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

/**
  * Sharing controller. This controller handle all the authenticated operation on shared elements.
  */
class SharingManagementController(
  cc: ControllerComponents,
  sharingService: SharingService
)(implicit
  ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils {

  /**
    * Lists all sharings on the `path` node of the authenticated user.
    *
    * @param path The path of the node.
    */
  def list(path: Path): Action[AnyContent] = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      sharingService.listSharings(path)
    }
  }

  /**
    * Gets a sharing by its reference.
    *
    * @param reference The reference of the sharing.
    */
  def get(reference: String): Action[AnyContent] = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      sharingService.findSharing(reference)
    }
  }

  /**
    * Deletes a sharing by its reference.
    *
    * @param reference The reference of the sharing to delete.
    */
  def delete(reference: String): Action[AnyContent] = AuthenticatedAction.async { implicit request =>
    ApiResponse {
      sharingService.deleteSharing(reference)
    }
  }

}
