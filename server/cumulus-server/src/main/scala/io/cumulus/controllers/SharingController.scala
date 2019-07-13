package io.cumulus.controllers

import java.util.UUID

import io.cumulus.Settings
import io.cumulus.controllers.payloads.SharingCreationPayload
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.models.sharing.Sharing
import io.cumulus.services.{SessionService, SharingService}
import play.api.libs.json.{JsString, Json}
import play.api.mvc.{Action, AnyContent, ControllerComponents}

import scala.concurrent.ExecutionContext


/**
  * Sharing controller. This controller handle all the authenticated operation on shared elements.
  */
class SharingController(
  cc: ControllerComponents,
  sharingService: SharingService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  val settings: Settings
) extends Api(cc) {

  /**
    * Lists all sharings of the authenticated user.
    * @param nodeId If specified, only list the sharings of the selected node.
    * @param limit The maximum number of sharings to return. Used for pagination.
    * @param offset The offset of elements to return. Used for pagination.
    */
  def list(nodeId: Option[UUID], limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      val pagination = QueryPagination(limit, offset)

      nodeId
        .map { id =>
          sharingService.listSharings(id, pagination)
        }
        .getOrElse {
          sharingService.listAllSharings(pagination)
        }
        .toResult
    }

  /**
    * Create a new sharing on a specified file, with the specified configuration.
    */
  def create: Action[SharingCreationPayload] =
    AuthenticatedAction.async(parseJson[SharingCreationPayload]) { implicit request =>
      val payload = request.body

      sharingService
        .shareNode(payload.nodeId, payload.duration)
        .map(_.map { case (node, sharing, secretCode) =>
          // Add key, download URL and path
          Json.toJsObject(sharing)(Sharing.apiWrite) +
            ("key" -> Json.toJson(secretCode)) +
            ("download" -> JsString(routes.SharingPublicController.downloadRoot(sharing.reference, node.path.name, secretCode, None).url)) +
            ("path" -> JsString(routes.SharingPublicController.get("/", sharing.reference, secretCode).url))
        })
        .toResult
    }

  /**
    * Gets a sharing by its reference.
    * @param reference The reference of the sharing.
    */
  def get(reference: String): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      sharingService.findSharing(reference).toResult
    }

  /**
    * Deletes a sharing by its reference.
    * @param reference The reference of the sharing to delete.
    */
  def delete(reference: String): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      sharingService.deleteSharing(reference).toResult
    }

}
