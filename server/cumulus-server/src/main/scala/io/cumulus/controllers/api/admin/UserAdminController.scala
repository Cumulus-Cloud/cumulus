package io.cumulus.controllers.api.admin

import io.cumulus.Settings
import io.cumulus.controllers.Api
import io.cumulus.controllers.api.payloads.{SignUpPayload, UserCreationPayload}
import io.cumulus.persistence.query.QueryPagination
import io.cumulus.models.user.UserUpdate
import io.cumulus.services.SessionService
import io.cumulus.services.admin.UserAdminService
import play.api.mvc.{Action, AnyContent, ControllerComponents}

import scala.concurrent.ExecutionContext


class UserAdminController(
  cc: ControllerComponents,
  userServiceAdmin: UserAdminService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  val settings: Settings
) extends Api(cc) {

  /**
    * Creates a new user.
    */
  def create: Action[UserCreationPayload] =
    AuthenticatedAction.andThen(WithAdmin).async(parseJson[UserCreationPayload]){ implicit request =>
      val userCreationPayload = request.body

      userServiceAdmin.createUser(
        userCreationPayload.email,
        userCreationPayload.login
      ).toResult
    }

  /**
    * Lists existing user.
    * @param limit The maximum number of sharings to return. Used for pagination.
    * @param offset The offset of elements to return. Used for pagination.
    */
  def list(limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.andThen(WithAdmin).async { implicit request =>
        // TODO allow filter user
        val pagination = QueryPagination(limit, offset)

        userServiceAdmin.listUsers(pagination).toResult
    }

  /**
    * Returns an user by its ID.
    * @param userId The ID of the user to return.
    */
  def get(userId: String): Action[AnyContent] =
    AuthenticatedAction.andThen(WithAdmin).async { implicit request =>
      userServiceAdmin.findUser(userId).toResult
    }

  /**
    * Update an user with the provided information.
    * @param userId The ID of the user to update.
    */
  def update(userId: String): Action[UserUpdate] =
    AuthenticatedAction.andThen(WithAdmin).async(parseJson[UserUpdate]) { implicit request =>
      val update = request.body

      userServiceAdmin.updateUser(userId, update).toResult
    }

  /**
    * Deactivate an user.
    * @param userId The ID of the user to update.
    */
  def deactivate(userId: String): Action[SignUpPayload] =
    AuthenticatedAction.andThen(WithAdmin).async(parseJson[SignUpPayload]) { implicit request =>
      userServiceAdmin.deactivateUser(userId).toResult
    }

}
