package io.cumulus.models

import java.time.LocalDateTime
import java.util.UUID
import scala.language.implicitConversions

import org.mindrot.jbcrypt.BCrypt
import play.api.libs.functional.syntax._
import play.api.libs.json._

/**
  * Session of the user. The private key is also used for decrypt and encrypt files, and thus should be present when
  * crypting and decrypting files.
  *
  * @param user The connected user
  * @param privateKey The user's private key
  */
case class UserSession(
  user: User,
  privateKey: String
)

object UserSession {

  implicit def userSessionToUser(userSession: UserSession): User =
    userSession.user

  implicit def format: Format[UserSession] =
    Json.format[UserSession]

}

/**
  * An user account
  *
  * @param id The unique ID
  * @param email The mail
  * @param login The login
  * @param password The hashed password
  * @param key The secret key, ciphered with the server secret key
  * @param creation The creation date
  * @param roles The roles of the user
  */
case class User(
  id: UUID,
  email: String,
  login: String,
  password: String,
  key: String,
  creation: LocalDateTime,
  roles: Seq[String]
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

object User {

  def apply(email: String, login: String, password: String): User =
    User(
      UUID.randomUUID(),
      email,
      login,
      BCrypt.hashpw(password, BCrypt.gensalt()),
      "", //Utils.Crypto.encrypt(Utils.Crypto.randomSalt(512)), // Generate a random key large enough
      LocalDateTime.now,
      Seq[String]("user", "admin") // TODO remove admin :)
    )

  val apiWrite: OWrites[User] =(
    (__ \ "id").write[String] and
    (__ \ "email").write[String] and
    (__ \ "login").write[String] and
    (__ \ "creation").write[LocalDateTime] and
    (__ \ "role").write[Seq[String]]
  )(user =>
    (
      user.id.toString,
      user.email,
      user.login,
      user.creation,
      user.roles
    )
  )

  implicit def format: Format[User] =
    Json.format[User]

  /*
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
  */

}