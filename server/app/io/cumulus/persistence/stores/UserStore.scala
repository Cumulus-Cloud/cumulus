package io.cumulus.persistence.stores

import java.time.LocalDateTime
import java.util.UUID

import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository}
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.models.User

class UserStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[User, CumulusDB, UUID] with AnormRepository[User, CumulusDB] {

  val table: String   = UserStore.table
  val pkField: String = UserStore.pkField

  def rowParser: RowParser[User] = {
    (
      SqlParser.get[UUID]("id") ~
      SqlParser.get[String]("email") ~
      SqlParser.get[String]("login") ~
      SqlParser.get[String]("password") ~
      SqlParser.get[String]("key") ~
      SqlParser.get[LocalDateTime]("creation") ~
      SqlParser.get[Array[String]]("roles")
    ).map {
      case id ~ email ~ login ~ password ~ key ~ creation ~ roles =>
        User(id, email, login, password, key, creation, roles)
    }
  }

  def getParams(user: User): Seq[NamedParameter] = {
    Seq(
      'id       -> user.id,
      'email    -> user.email,
      'login    -> user.login,
      'password -> user.password,
      'key      -> user.key,
      'creation -> user.creation,
      'roles    -> user.roles.toArray
    )
  }

}

object UserStore {

  val table: String = "cumulus_user"

  val pkField: String    = "id"
  val emailField: String = "email"
  val loginField: String = "login"

}
