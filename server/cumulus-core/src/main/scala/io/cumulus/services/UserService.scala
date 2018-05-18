package io.cumulus.services

import java.util.UUID

import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE}
import io.cumulus.core.validation.AppError
import io.cumulus.core.{Logging, Settings}
import io.cumulus.models.fs.Directory
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.UserStore._
import io.cumulus.persistence.stores.{FsNodeStore, UserStore}
import io.cumulus.views.email.CumulusEmailValidationEmail
import play.api.i18n.Messages
import play.api.libs.json.__

import scala.concurrent.Future
import scala.util.Try

/**
  * User service, which handle the business logic and validations of the users.
  */
class UserService(
  userStore: UserStore,
  fsNodeStore: FsNodeStore,
  mailService: MailService
)(
  implicit
  settings: Settings,
  qb: QueryBuilder[CumulusDB]
) extends Logging {

  /**
    * Creates a new user. The provided user should have an unique ID, email and login ; otherwise the creation will
    * return an error.
    * @param user The user to be created.
    */
  def createUser(
    user: User
  )(implicit
    messages: Messages
  ): Future[Either[AppError, User]] = {

    for {
      // Check for duplicated UUID. Should not really happen...
      _ <- QueryE(userStore.find(user.id).map {
        case Some(_) => Left(AppError.validation(__ \ "id", "validation.user.uuid-already-exists", user.id.toString))
        case None    => Right(())
      })

      // Also check for user with the same login or email
      _ <- QueryE(userStore.findBy(emailField, user.email).map {
        case Some(_) => Left(AppError.validation(__ \ "email", "validation.user.email-already-exists", user.email))
        case None    => Right(())
      })
      _ <- QueryE(userStore.findBy(loginField, user.login).map {
        case Some(_) => Left(AppError.validation(__ \ "login", "validation.user.login-already-exists", user.login))
        case None    => Right(())
      })

      // Create the new user
      _ <- QueryE.lift(userStore.create(user))

      // Also create the root element of its own file-system
      _ <- QueryE.lift(fsNodeStore.create(Directory.create(user.id, "/")))

      // Finally, send the user a mail with a link to validate its account
      _ <- QueryE.pure {
        mailService
          .sendToUser(
            messages("email.email-validation.object"),
            CumulusEmailValidationEmail(user),
            user
          )
      }

    } yield user

  }.commit()

  /**
    * Finds an user by its ID.
    * @param id The user of the user.
    */
  def find(id: String): Future[Either[AppError, User]] = {

    for {
      // Validate the provided UUID
      uuid <- QueryE.pure {
        Try(UUID.fromString(id))
          .toEither
          .left.map(_ => AppError.validation("validation.user.uuid-invalid", id))
      }

      // Find the user by its ID
      user <- QueryE.getOrNotFound(userStore.find(uuid))
    } yield user

  }.commit()

  /**
    * Finds and user by its email.
    * @param email The email of the user.
    */
  def findByEmail(email: String): Future[Either[AppError, User]] =
    QueryE
      .getOrNotFound(userStore.findBy(emailField, email))
      .commit()

  /**
    * Finds an user by its login.
    * @param login The login of the user.
    */
  def findByLogin(login: String): Future[Either[AppError, User]] =
    QueryE
      .getOrNotFound(userStore.findBy(loginField, login))
      .commit()

  /**
    * Checks an user password and login, and return either an error or the found user. Use this method to validate
    * an user logging in.
    * @param login The user's login.
    * @param password The user's password.
    */
  def loginUser(login: String, password: String): Future[Either[AppError, User]] = {

    // Search an user by the login & check the hashed password
    userStore.findBy(loginField, login).map {
      case Some(user) if user.security.checkPassword(password) =>
        if (!user.security.emailValidated)
          Left(AppError.validation("validation.user.email-not-activated"))
        else if (!user.security.activated)
          Left(AppError.validation("validation.user.user-deactivated "))
        else
          Right(user)
      case _ =>
        Left(AppError.validation("validation.user.invalid-login-or-password"))
    }

  }.run()

  /**
    * Validate an user email, using the provided login and the secret email code (sent by email, to check the email
    * account).
    * @param login The user's login.
    * @param emailCode The email validation code.
    */
  def validateUserEmail(login: String, emailCode: String): Future[Either[AppError, User]] = {

    for {
      // Find the user by the login
      maybeUser <- QueryE.lift(userStore.findBy(loginField, login))

      // Update the email validation
      updatedUser <- QueryE.pure {
        maybeUser match {
          case Some(user) if user.security.checkEmailCode(emailCode) =>
            if(user.security.emailValidated)
              Left(AppError.validation("validation.user.email-already-validated"))
            else
              Right(user.copy(security = user.security.validateEmail))
          case _ =>
            Left(AppError.validation("validation.user.invalid-login-or-email-code"))
        }
      }

      // Save the modifications
      _ <- QueryE.lift(userStore.update(updatedUser))

    } yield updatedUser

  }.commit()

}
