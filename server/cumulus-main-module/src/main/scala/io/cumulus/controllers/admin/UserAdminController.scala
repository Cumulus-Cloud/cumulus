package io.cumulus.controllers.admin

import io.cumulus.controllers.payloads.SignUpPayload
import io.cumulus.controllers.utils.UserAuthentication
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.persistence.query.QueryPagination
import io.cumulus.models.user.{UserRole, UserUpdate}
import io.cumulus.services.SessionService
import io.cumulus.services.admin.UserAdminService
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.ExecutionContext

class UserAdminController(
  cc: ControllerComponents,
  userServiceAdmin: UserAdminService,
  val sessionService: SessionService
)(implicit
  val ec: ExecutionContext,
  settings: Settings
) extends AbstractController(cc) with UserAuthentication with ApiUtils with BodyParserJson {

  /**
    * Creates a new user.
    */
  def create: Action[SignUpPayload] =
    AuthenticatedAction.async(parseJson[SignUpPayload]) { implicit request =>
      ApiResponse {
        val signInPayload = request.body

        userServiceAdmin.createUser(
          signInPayload.email,
          signInPayload.login,
          signInPayload.password,
          Seq(UserRole.User) // Only user for now
        )
      }
    }

  /**
    * Lists existing user.
    * @param limit The maximum number of sharings to return. Used for pagination.
    * @param offset The offset of elements to return. Used for pagination.
    */
  def list(limit: Option[Int], offset: Option[Int]): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        // TODO allow filter user
        val pagination = QueryPagination(limit, offset)

        userServiceAdmin.listUsers(pagination)
      }
    }

  /**
    * Returns an user by its ID.
    * @param userId The ID of the user to return.
    */
  def get(userId: String): Action[AnyContent] =
    AuthenticatedAction.async { implicit request =>
      ApiResponse {
        userServiceAdmin.findUser(userId)
      }
    }

  /**
    * Update an user with the provided information.
    * @param userId The ID of the user to update.
    */
  def update(userId: String): Action[UserUpdate] =
    AuthenticatedAction.async(parseJson[UserUpdate]) { implicit request =>
      ApiResponse {
        val update = request.body

        userServiceAdmin.updateUser(userId, update)
      }
    }

  /**
    * Deactivate an user.
    * @param userId The ID of the user to update.
    */
  def deactivate(userId: String): Action[SignUpPayload] =
    AuthenticatedAction.async(parseJson[SignUpPayload]) { implicit request =>
      ApiResponse {
        userServiceAdmin.deactivateUser(userId)
      }
    }

}
