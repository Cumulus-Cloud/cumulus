package io.cumulus.controllers.api.admin

import akka.http.scaladsl.server.Directives.{path, post, _}
import akka.http.scaladsl.server.Route
import io.cumulus.controllers.api.payloads.UserCreationPayload
import io.cumulus.controllers.utils
import io.cumulus.controllers.utils.ApiComponent
import io.cumulus.i18n.Messages
import io.cumulus.models.user.UserUpdate
import io.cumulus.models.user.session.{AuthenticationToken, UserSession}
import io.cumulus.services.admin.UserAdminService
import io.cumulus.Settings

import scala.concurrent.ExecutionContext


class UserAdminController(
  userServiceAdmin: UserAdminService,
  val auth: utils.Authenticator[AuthenticationToken, UserSession]
)(implicit
  val m: Messages,
  val ec: ExecutionContext,
  val settings: Settings
) extends ApiComponent {

  val routes: Route =
    concat(
      create,
      list,
      getById,
      updateById,
      deactivateById
    )

  /**
    * Creates a new user.
    */
  def create: Route =
    (post & path("api" / "admin" / "users") & payload[UserCreationPayload]) { payload =>
      withAuthentication { implicit ctx =>
        userServiceAdmin.createUser(
          payload.email,
          payload.login
        ).toResult
      }
    }

  /**
    * Lists existing user.
    */
  def list: Route =
    (get & path("api" / "admin" / "users") & paginationParams) { pagination =>
      withAuthentication { implicit ctx =>
        userServiceAdmin.listUsers(pagination).toResult
      }
    }

  /**
    * Returns an user by its ID.
    */
  def getById: Route =
    (get & path("api" / "admin" / "users" / JavaUUID)) { userId =>
      withAuthentication { implicit ctx =>
        userServiceAdmin.findUser(userId).toResult
      }
    }

  /**
    * Update an user with the provided information.
    */
  def updateById: Route =
    (post & path("api" / "admin" / "users" / JavaUUID) & payload[UserUpdate]) { (userId, payload) =>
      withAuthentication { implicit ctx =>
        userServiceAdmin.updateUser(userId, payload).toResult
      }
    }

  /**
    * Deactivate an user.
    */
  def deactivateById: Route =
    (delete & path("api" / "admin" / "users" / JavaUUID)) { userId =>
      withAuthentication { implicit ctx =>
        userServiceAdmin.deactivateUser(userId).toResult
      }
    }

}
