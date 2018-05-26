package io.cumulus.services.admin

import io.cumulus.core.Settings
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE, QueryPagination}
import io.cumulus.core.utils.PaginatedList
import io.cumulus.core.utils.PaginatedList._
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.{User, UserRole, UserUpdate}
import io.cumulus.persistence.stores.UserStore.{emailField, loginField}
import io.cumulus.persistence.stores.filters.UserFilter
import io.cumulus.persistence.stores.orderings.UserOrdering
import io.cumulus.persistence.stores.orderings.UserOrderingType.OrderByCreationAsc
import io.cumulus.persistence.stores.{FsNodeStore, UserStore}
import io.cumulus.services.{MailService, UserService, UserServiceCommon}
import play.api.i18n.Messages

import scala.concurrent.Future

/**
  * User admin service, which handle the administration of the users.
  */
class UserAdminService(
  val userStore: UserStore,
  val fsNodeStore: FsNodeStore,
  val mailService: MailService
)(
  implicit
  val settings: Settings,
  val qb: QueryBuilder[CumulusDB]
) extends UserServiceCommon {

  /**
    * Creates a new user by an admin. The provided user should have an unique ID, email and login ; otherwise the
    * creation will fail and return an error.
    */
  def createUser(
    email: String,
    login: String,
    password: String,
    roles: Seq[UserRole]
  )(implicit
    admin: User,
    messages: Messages
  ): Future[Either[AppError, User]] = {
    val user = User.create(email, login, password).copy(roles = roles)

    // TODO the password should not be provided

    for {
      _ <- QueryE.pure(UserService.requireAdmin(admin))
      _ <- createUserInternal(user)
    } yield user

  }.commit()


  /**
    * Lists all the users. Only usable by an admin.
    * @param pagination The pagination to use. See [[io.cumulus.core.persistence.query.QueryPagination QueryPagination]].
    * @param filter The filter to use. See [[io.cumulus.persistence.stores.filters.UserFilter UserFilter]].
    * @param admin The admin performing the operation.
    */
  def listUsers(
    pagination: QueryPagination,
    filter: UserFilter = UserFilter()
  )(implicit admin: User): Future[Either[AppError, PaginatedList[User]]] = {

    for {
      // Check that the user is an admin
      _ <- QueryE.pure(UserService.requireAdmin(admin))

      // List all the users
      users <- QueryE.lift(userStore.findAll(filter, UserOrdering.of(OrderByCreationAsc), pagination))

    } yield users.toPaginatedList(pagination.offset)

  }.run()


  /**
    * Updates an use with the provided information. The user target should be different from the current user.
    */
  def updateUser(
    userId: String,
    update: UserUpdate
  )(implicit admin: User, messages: Messages): Future[Either[AppError, User]] = {

    for {
      // Check that the user is an admin
      _ <- QueryE.pure(UserService.requireAdmin(admin))

      // Find the user to update
      user <- findUserInternal(userId)

      // Cannot performs any operation on the current user
      _ <- QueryE.pure(UserService.notSelf(user))

      // Update the user's email and email validation
      updatedUserEmail <- (update.email, update.emailValidation) match {
        case (Some(email), Some(emailValidation)) =>
          changeUserEmail(user, email, emailValidation)
        case (Some(email), None) =>
          changeUserEmail(user, email, emailValidated = false)
        case (None, Some(emailValidation)) =>
          changeUserEmail(user, user.email, emailValidation)
        case (None, None) =>
          QueryE.pure(user)
      }

      // Update the user's activation
      updatedUserActivation <- update.activated match {
        case Some(activation) =>
          changeUserActivation(updatedUserEmail, activation)
        case None =>
          QueryE.pure(updatedUserEmail)
      }

      // Update the user login
      updatedUserLogin <- update.login match {
        case Some(login) =>
          changeUserLogin(updatedUserActivation, login)
        case None =>
          QueryE.pure(updatedUserActivation)
      }

    } yield updatedUserLogin

  }.commit()

  /**
    * Deactivates an user.
    * @param userId The ID of the user to deactivate.
    */
  def deactivateUser(
    userId: String
  )(implicit admin: User): Future[Either[AppError, User]] = {

    for {
      // Check that the user is an admin
      _ <- QueryE.pure(UserService.requireAdmin(admin))

      // Find the user to update
      user <- findUserInternal(userId)

      // Cannot performs any operation on the current user
      _ <- QueryE.pure(UserService.notSelf(user))

      // Deactivate the user
      deactivatedUser <- changeUserActivation(user, activation = false)

    } yield deactivatedUser

  }.commit()

  /**
    * Finds an user by its ID. Only usable by an admin.
    * @param id The user of the user.
    */
  def findUser(id: String)(implicit admin: User): Future[Either[AppError, User]] = {

    for {
      // Check that the user is an admin
      _ <- QueryE.pure(UserService.requireAdmin(admin))

      // Find the user by its ID
      user <- findUserInternal(id)

    } yield user

  }.commit()

  /**
    * Finds and user by its email. Only usable by an admin.
    * @param email The email of the user.
    */
  def findUserByEmail(email: String)(implicit admin: User): Future[Either[AppError, User]] = {

    for {
      // Check that the user is an admin
      _ <- QueryE.pure(UserService.requireAdmin(admin))

      user <- QueryE.getOrNotFound(userStore.findBy(emailField, email))

    } yield user

  }.commit()

  /**
    * Finds an user by its login.
    * @param login The login of the user.
    */
  def findUserByLogin(login: String)(implicit admin: User): Future[Either[AppError, User]] = {

    for {
      // Check that the user is an admin
      _ <- QueryE.pure(UserService.requireAdmin(admin))

      user <- QueryE.getOrNotFound(userStore.findBy(loginField, login))

    } yield user

  }.commit()

}
