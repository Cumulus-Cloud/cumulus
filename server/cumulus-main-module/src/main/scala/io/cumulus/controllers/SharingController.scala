package io.cumulus.controllers

import java.util.UUID

import io.cumulus.controllers.payloads.SharingCreationPayload
import io.cumulus.controllers.utils.UserAuthentication
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.models.sharing.Sharing
import io.cumulus.services.{SessionService, SharingService}
import play.api.libs.json.{JsString, Json}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

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
  settings: Settings
) extends AbstractController(cc) with UserAuthentication with BodyParserJson with ApiUtils {

  /**
    * Lists all sharings of the authenticated user.
    * @param nodeId If specified, only list the sharings of the selected node.
    * @param limit The maximum number of sharings to return. Used for pagination.
    * @param offset The offset of elements to return. Used for pagination.
    */
  def list(nodeId: Option[UUID], limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        val pagination = QueryPagination(limit, offset)

        nodeId
          .map { id =>
            sharingService.listSharings(id, pagination)
          }
          .getOrElse {
            sharingService.listAllSharings(pagination)
          }
      }
    }

  /**
    * Create a new sharing on a specified file, with the specified configuration.
    */
  def create: Action[SharingCreationPayload] =
    AuthenticatedAction.async(parseJson[SharingCreationPayload]) { implicit request =>
      ApiResponse {
        val payload = request.body

        sharingService.shareNode(payload.nodeId, payload.duration).map {
          case Right((node, sharing, secretCode)) =>
            Right(
              Json.toJsObject(sharing)(Sharing.apiWrite)
                + ("key" -> Json.toJson(secretCode))
                + ("download" -> JsString(routes.SharingPublicController.downloadRoot(sharing.reference, node.path.name, secretCode, None).url))
                + ("path" -> JsString(routes.SharingPublicController.get("/", sharing.reference, secretCode).url))
            )
          case Left(e) =>
            Left(e)
        }
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
