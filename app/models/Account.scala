package models

import java.util.UUID

import org.joda.time.DateTime
import org.mindrot.jbcrypt.BCrypt

import play.api.libs.json._
import play.api.libs.functional.syntax._
import utils.{Conf, Utils}
import utils.Utils.Crypto.random

/**
  * An user account
  *
  * @param id The unique ID
  * @param mail The mail
  * @param login The login
  * @param password The hashed password
  * @param key The secret key, ciphered with the server secret key
  * @param creation The creation date
  * @param roles The roles of the user
  * @param home The home directory, if available
  */
case class Account(
  id: UUID,
  mail: String,
  login: String,
  password: String,
  key: String,
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
    key: String,
    creation: DateTime,
    roles: Seq[String],
    home: Option[String]
  ): Account = Account(
    UUID.fromString(id),
    mail,
    login,
    password,
    key,
    creation,
    roles,
    home
  )

  def initFrom(mail: String, login: String, password: String)(implicit conf: Conf): Account = Account(
    UUID.randomUUID(),
    mail,
    login,
    BCrypt.hashpw(password, BCrypt.gensalt()),
    Utils.Crypto.encrypt(Utils.Crypto.randomSalt(512)), // Generate a random key large enough
    DateTime.now,
    Seq[String]("user", "admin"), // TODO remove admin :)
    None
  )

  def empty: Account = Account(
    UUID.randomUUID(),
    "",
    "",
    "",
    "",
    DateTime.now,
    Seq.empty[String],
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
