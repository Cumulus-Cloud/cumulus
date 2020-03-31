package io.cumulus.controllers.api

import java.util.UUID

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import io.cumulus.controllers.api.payloads.SharingCreationPayload
import io.cumulus.i18n.Messages
import io.cumulus.models.sharing.Sharing
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.services.SharingService
import io.cumulus.{ApiComponent, Authenticator, Settings}
import play.api.libs.json.{JsString, Json}

import scala.concurrent.ExecutionContext
import scala.language.postfixOps


/**
  * Sharing controller. This controller handle all the authenticated operation on shared elements.
  */
class SharingController(
  sharingService: SharingService,
  val auth: Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends ApiComponent {

  val routes: Route =
    concat(
      list,
      create,
      getByReference,
      deleteByReference
    )

  /**
    * Lists all sharings of the authenticated user.
    */
  def list: Route =
    (post & path("api" / "sharings") & parameters("nodeId".as[UUID]?) & paginationParams) { (nodeId, pagination) =>
      withAuthentication { implicit ctx =>
        nodeId
          .map { id =>
            sharingService.listSharings(id, pagination)
          }
          .getOrElse {
            sharingService.listAllSharings(pagination)
          }
          .toResult
      }
    }

  /**
    * Create a new sharing on a specified file, with the specified configuration.
    */
  def create: Route =
    (post & path("api" / "sharings") & payload[SharingCreationPayload]) { payload =>
      withAuthentication { implicit ctx =>
        sharingService
          .shareNode(payload.nodeId, payload.duration)
          .map(_.map { case (node, sharing, secretCode) =>
            // Add key, download URL and path
            Json.toJsObject(sharing)(Sharing.apiWrite) +
              ("key" -> Json.toJson(secretCode)) +
              ("download" -> JsString(s"/api/shared/download/${sharing.reference}/${node.path.name}?key=$secretCode")) +
              ("path" -> JsString(s"/api/shared/fs/?reference=${sharing.fsNode}&key=$secretCode"))
          })
          .toResultAs(StatusCodes.Created)
      }
    }

  /**
    * Gets a sharing by its reference.
    */
  def getByReference: Route =
    (get & path("api" / "sharings" / Segment)) { reference =>
      withAuthentication{ implicit ctx =>
        sharingService.findSharing(reference).toResult
      }
    }

  /**
    * Deletes a sharing by its reference.
    */
  def deleteByReference: Route =
    (delete & path("api" / "sharings" / Segment)) { reference =>
      withAuthentication { implicit ctx =>
        sharingService.deleteSharing(reference).toResult
      }
    }

}
