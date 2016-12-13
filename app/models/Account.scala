package models

import java.util.UUID

import org.joda.time.DateTime
import org.mindrot.jbcrypt.BCrypt

import play.api.libs.json._
import play.api.libs.functional.syntax._

case class Account(
  id: UUID,
  mail: String,
  login: String,
  password: String,
  creation: DateTime,
  roles: Seq[String],
  home: Option[String]
) {

  /**
    * Check if the acount is an admin account
    *
    * @return True if the user is an admin, false otherwise
    */
  def isAdmin: Boolean = {
    roles.contains("admin")
  }

}

object Account {

  def apply(
    id: String,
    mail: String,
    login: String,
    password: String,
    creation: DateTime,
    roles: Seq[String],
    home: Option[String]
  ): Account = Account(
    UUID.fromString(id),
    mail,
    login,
    password,
    creation,
    roles,
    home
  )

  def initFrom(mail: String, login: String, password: String): Account = Account(
    UUID.randomUUID(),
    mail,
    login,
    BCrypt.hashpw(password, BCrypt.gensalt()),
    DateTime.now,
    Seq[String]("user"),
    None
  )

  implicit val userWrites: Writes[Account] = (
    (__ \ "id").write[UUID] and
    (__ \ "login").write[String] and
    (__ \ "creation").write[String] and
    (__ \ "roles").write[Seq[String]] and
    (__ \ "home").writeNullable[String]
  )(user => (user.id, user.login, user.creation.toString, user.roles, user.home))
}
