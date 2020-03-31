package io.cumulus.services

import io.cumulus.Settings
import io.cumulus.i18n.{Lang, Messages}
import io.cumulus.persistence.query.{QueryE, QueryRunner}
import io.cumulus.persistence.query.QueryRunner._
import io.cumulus.persistence.query.QueryE._
import io.cumulus.validation.AppError
import io.cumulus.models.user.session.UserSession
import io.cumulus.models.user.{User, UserSecurity}
import io.cumulus.persistence.stores.UserStore._
import io.cumulus.persistence.stores.filters.SessionFilter
import io.cumulus.persistence.stores.{FsNodeStore, SessionStore, UserStore}
import io.cumulus.views.email.CumulusEmailValidationEmail

import scala.concurrent.Future
import scala.util.Try


/**
  * User service, which handle the business logic and validations of the users.
  */
class UserService(
  val userStore: UserStore,
  val fsNodeStore: FsNodeStore,
  val mailService: MailService,
  sessionStore: SessionStore
)(
  implicit
  val settings: Settings,
  val messages: Messages,
  queryRunner: QueryRunner[Future]
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
  )(implicit lang: Lang): Future[Either[AppError, User]] = {
    val user =
      User.create(
        email,
        login,
        password,
        messages.preferredLocale.locale // Use default lang
      )

    if(settings.management.allowSignUp)
      createUserInternal(user).commit()
    else
      Future.successful(Left(AppError.forbidden("validation.user.sign-up-deactivated")))
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
        UserService.checkUsableUser(user)
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
  )(implicit lang: Lang): Future[Either[AppError, User]] = {

    for {
      // Find the user by login and password
      user <- QueryE {
        userStore
          .findBy(loginField, login)
          .map {
            case Some(user) if user.security.checkPassword(password) =>
              UserService.checkUsableUser(user)
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
    * @param validationCode The email validation code.
    */
  def validateUserEmail(
    login: String,
    validationCode: String
  ): Future[Either[AppError, User]] = {

    for {
      // Find the user by the login
      maybeUser <- QueryE.lift(userStore.findBy(loginField, login))

      // Update the email validation
      updatedUser <- QueryE.pure {
        maybeUser match {
          case Some(user) if user.security.checkValidationCode(validationCode) =>
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

  /**
    * Set the first password if the account has no password already set.
    * @param login The login of the user.
    * @param password The first password of the user.
    * @param validationCode The email validation code.
    */
  def setUserFirstPassword(
    login: String,
    password: String,
    validationCode: String
  ): Future[Either[AppError, User]] = {

    for {
      // Find the user by the login
      user <- QueryE.getOrNotFound(userStore.findBy(loginField, login))

      // Check if the user is waiting for a password & that the validation code is correct
      _ <- QueryE.pure {
        if(user.security.needFirstPassword && user.security.checkValidationCode(validationCode))
          Right(())
        else
          Left(AppError.notFound("api-error.not-found"))
      }

      // Set the first password
      newSecurity = UserSecurity.create(password)
      updatedUser = user.copy(
        security = user.security.copy(
          encryptedPrivateKey = newSecurity.encryptedPrivateKey,
          salt1               = newSecurity.salt1,
          iv                  = newSecurity.iv,
          passwordHash        = newSecurity.passwordHash,
          salt2               = newSecurity.salt2
        )
      )

      // Save the update
      _ <- QueryE.lift(userStore.update(updatedUser))

    } yield updatedUser

  }.commit()

  /**
    * Updates the language of the current user.
    * @param lang The new language.
    * @param user The user performing the operation.
    */
  def updateUserLanguage(
    lang: String
  )(implicit user: User): Future[Either[AppError, User]] = {

    for {
      updatedUser <- QueryE.pure {
        Try(Lang(lang))
          .toEither
          .left.map(_ => AppError.validation("validation.user.invalid-lang"))
          .map { validatedLang =>
            user.copy(lang = validatedLang.locale)
          }
      }

      _ <- QueryE.lift(userStore.update(updatedUser))

    } yield updatedUser

  }.run()

  /**
    * Update the current user password. This will also revoke all the user's sessions.
    * @param actualPassword The actual password.
    * @param newPassword The new password.
    */
  def updateUserPassword(
    actualPassword: String,
    newPassword: String
  )(implicit session: UserSession): Future[Either[AppError, User]] = {
    implicit val user: User = session.user

    for {
      // Update the user's password
      updatedUser <- QueryE.pure {
        if (user.security.checkPassword(actualPassword))
          Right(user.copy(security = user.security.changePassword(actualPassword, newPassword)))
        else
          Left(AppError.validation("validation.user.invalid-login-or-password"))
      }

      // Update the user
      _ <- QueryE.lift(userStore.update(updatedUser))

      // Revoke all the sessions (except the current) of the user (because the password is stored in the session)
      sessions        <- QueryE.lift(sessionStore.findAllAndLock(SessionFilter(user, revoked = Some(false))))
      updatedSessions =  sessions.filterNot(_.id == session.information.id).map(_.revoke)
      _               <- QueryE.seq(updatedSessions.map(s => sessionStore.update(s).map(Right.apply)))

    } yield updatedUser

  }.commit()

}

object UserService {

  def checkRequireAdmin(user: User): Either[AppError, User] = {
    if(!user.isAdmin)
      Left(AppError.forbidden("validation.user.admin-required"))
    else
      Right(user)
  }

  def checkNotSelf(user: User)(implicit other: User): Either[AppError, User] = {
    if(user.id == other.id)
      Left(AppError.validation("validation.user.not-self")) // TODO key
    else
      Right(user)
  }

  def checkUsableUser(user: User): Either[AppError, User] = {
    // The email needs to be validated
    if (!user.security.emailValidated)
      Left(AppError.validation("validation.user.email-not-activated"))
    // The account needs to be active
    else if (!user.security.activated)
      Left(AppError.validation("validation.user.user-deactivated "))
    // The password need to be set
    else if (user.security.needFirstPassword)
      Left(AppError.validation("validation.user.need-password"))
    else
      Right(user)
  }

}
