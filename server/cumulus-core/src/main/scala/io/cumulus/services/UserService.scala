package io.cumulus.services

import io.cumulus.core.Settings
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE}
import io.cumulus.core.validation.AppError
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.UserStore._
import io.cumulus.persistence.stores.{FsNodeStore, UserStore}
import io.cumulus.views.email.CumulusEmailValidationEmail
import play.api.i18n.Messages

import scala.concurrent.Future

/**
  * User service, which handle the business logic and validations of the users.
  */
class UserService(
  val userStore: UserStore,
  val fsNodeStore: FsNodeStore,
  val mailService: MailService
)(
  implicit
  val settings: Settings,
  val qb: QueryBuilder[CumulusDB]
) extends UserServiceCommon {

  /**
    * Creates a new user. The provided user should have an unique ID, email and login ; otherwise the creation will
    * fail and return an error.
    * @param email The email of the user to be created.
    * @param login The login of the user to be created.
    * @param password The password of the user to be created.
    */
  def createUser(
    email: String,
    login: String,
    password: String
  )(implicit messages: Messages): Future[Either[AppError, User]] = {
    val user = User.create(email, login, password)

    createUserInternal(user)
      .commit()
  }

  /**
    * Checks an user password and login, and return either an error or the found user. Use this method to validate
    * an user logging in.
    * @param login The user's login.
    * @param password The user's password.
    */
  def checkLoginUser(
    login: String,
    password: String
  ): Future[Either[AppError, User]] = {

    // Search an user by the login & check the hashed password
    userStore.findBy(loginField, login).map {
      case Some(user) if user.security.checkPassword(password) =>
        UserService.validateUser(user)
      case _ =>
        Left(AppError.validation("validation.user.invalid-login-or-password"))
    }

  }.run()

  /**
    * Resend the email for the specified user.
    * @param login The login of the user.
    * @param password The password of the user.
    */
  def resendEmail(
    login: String,
    password: String
  )(implicit messages: Messages): Future[Either[AppError, User]] = {

    for {
      // Find the user by login and password
      user <- QueryE {
        userStore
          .findBy(loginField, login)
          .map {
            case Some(user) if user.security.checkPassword(password) =>
              UserService.validateUser(user)
            case _ =>
              Left(AppError.validation("validation.user.invalid-login-or-password"))
          }
      }

      // Only resend the email if the account is activated and the email is not already validated
      _ <- QueryE.pure {
        if(user.security.emailValidated)
          Left(AppError.validation("validation.user.email-already-validated"))
        else if(!user.security.activated)
          Left(AppError.validation("validation.user.user-deactivated "))
        else
          Right(
            mailService
              .sendToUser(
                messages("email.email-validation.object"),
                CumulusEmailValidationEmail(user),
                user
              )
          )
      }

    } yield user

  }.run()

  /**
    * Validate an user email, using the provided login and the secret email code (sent by email, to check the email
    * account).
    * @param login The user's login.
    * @param emailCode The email validation code.
    */
  def validateUserEmail(
    login: String,
    emailCode: String
  ): Future[Either[AppError, User]] = {

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

object UserService {

  def requireAdmin(user: User): Either[AppError, User] = {
    if(!user.isAdmin)
      Left(AppError.forbidden("validation.user.admin-required"))
    else
      Right(user)
  }

  def notSelf(user: User)(implicit other: User): Either[AppError, User] = {
    if(user.id == other.id)
      Left(AppError.validation("validation.user.not-self")) // TODO key
    else
      Right(user)
  }

  def validateUser(user: User): Either[AppError, User] = {
    if (!user.security.emailValidated)
      Left(AppError.validation("validation.user.email-not-activated"))
    else if (!user.security.activated)
      Left(AppError.validation("validation.user.user-deactivated "))
    else
      Right(user)
  }

}
