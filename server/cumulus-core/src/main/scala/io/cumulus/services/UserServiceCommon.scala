package io.cumulus.services

import io.cumulus.i18n.{Lang, Messages}
import io.cumulus.Settings
import io.cumulus.persistence.query.QueryE
import io.cumulus.validation.AppError
import io.cumulus.models.fs.Directory
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.UserStore.{emailField, loginField}
import io.cumulus.persistence.stores.{FsNodeStore, UserStore}
import io.cumulus.utils.Logging
import io.cumulus.views.email.ValidationEmail
import play.api.libs.json.__


trait UserServiceCommon extends Logging {

  protected def userStore: UserStore
  protected def fsNodeStore: FsNodeStore
  protected def mailService: MailService

  protected implicit def settings: Settings
  protected implicit def messages: Messages

  /**
    * Creates a new user. The provided user should have an unique ID, email and login ; otherwise the creation will
    * return an error.
    * @param user The user to be created.
    */
  protected def createUserInternal(
    user: User
  )(implicit
    lang: Lang
  ): QueryE[User] = {

    for {
      // Check for duplicated UUID. Should not really happen...
      _ <- QueryE(userStore.find(user.id).map {
        case Some(_) => Left(AppError.validation(__ \ "id", "error.validation.user.uuid-already-exists", user.id.toString))
        case None    => Right(())
      })

      // Also check for user with the same login or email
      _ <- QueryE(userStore.findBy(emailField, user.email).map {
        case Some(_) => Left(AppError.validation(__ \ "email", "error.validation.user.email-already-exists", user.email))
        case None    => Right(())
      })
      _ <- QueryE(userStore.findBy(loginField, user.login).map {
        case Some(_) => Left(AppError.validation(__ \ "login", "error.validation.user.login-already-exists", user.login))
        case None    => Right(())
      })

      // Create the new user
      _ <- QueryE.lift(userStore.create(user))

      // Also create the root element of its own file-system
      _ <- QueryE.lift(fsNodeStore.create(Directory.create(user, "/")))

      // Finally, send the user a mail with a link to validate its account
      _ = {
        // Non blocking
        mailService.sendToUser(
          messages("email.email-validation.object"),
          ValidationEmail(user),
          user
        )
      }

    } yield user

  }

  /**
    * Change the user login.
    */
  protected def changeUserLogin(
    user: User,
    login: String
  ): QueryE[User] = {
    val updatedUser = user.copy(login = login)

    if(user != updatedUser)
      QueryE.lift(userStore.update(updatedUser)).map(_ => updatedUser)
    else
      QueryE.pure(user)

  }

  /**
    * Change the email of an user. The email can also be validated or need a re-validation from the user.
    */
  protected def changeUserEmail(
    user: User,
    email: String,
    emailValidated: Boolean
  )(implicit lang: Lang): QueryE[User] = {
    val updatedUser = user.copy(email = email, security = user.security.copy(emailValidated = emailValidated))

    if(user != updatedUser) {

      for {
        _ <- QueryE.lift(userStore.update(updatedUser)).map(_ => updatedUser)

        // Only send the email validation if the email is not validated
        _ <- QueryE.pure {
          if(!emailValidated) {
            // Non blocking
            mailService
              .sendToUser(
                messages("email.email-validation.object"),
                ValidationEmail(user),
                user
              )
            ()
          } else
            ()
        }
      } yield updatedUser

    } else
      QueryE.pure(user)

  }

  /**
    * Change the user activation. Use for deactivating or activating an account.
    */
  protected def changeUserActivation(
    user: User,
    activation: Boolean
  ): QueryE[User] = {
    val updatedUser = user.copy(security = if(activation) user.security.activate else user.security.deactivate)

    if(user != updatedUser)
      QueryE.lift(userStore.update(updatedUser)).map(_ => updatedUser)
    else
      QueryE.pure(user)

  }

}
