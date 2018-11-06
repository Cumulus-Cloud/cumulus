package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.models.user.User

/**
  * User store, used to manage users in the database.
  */
class UserStore extends AnormPKOperations[User, UUID] with AnormRepository[User] {

  val table: String   = UserStore.table
  val pkField: String = UserStore.pkField

  val rowParser: RowParser[User] = {
    implicit val userColumn: Column[User] =
      AnormSupport.column[User](User.internalFormat)

    SqlParser.get[User]("metadata")
  }

  def getParams(user: User): Seq[NamedParameter] = {
    Seq(
      'id       -> user.id,
      'email    -> user.email,
      'login    -> user.login,
      'metadata -> User.internalFormat.writes(user)
    )
  }

}

object UserStore {

  val table: String = "cumulus_user"

  val pkField: String       = "id"
  val emailField: String    = "email"
  val loginField: String    = "login"
  val metadataField: String = "metadata"

}
