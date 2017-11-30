package io.cumulus.models

import java.security.Security
import java.time.LocalDateTime
import java.util.UUID
import scala.language.implicitConversions

import akka.util.ByteString
import io.cumulus.core.json.JsonFormat._
import io.cumulus.core.utils.Crypto
import io.cumulus.core.utils.Crypto._
import org.bouncycastle.jce.provider.BouncyCastleProvider
import play.api.libs.functional.syntax._
import play.api.libs.json._

/**
  * Common trait for both user session and sharing session
  */
trait Session {

  def user: User
  def privateKeyAndSalt: (ByteString, ByteString)

}

/**
  * Session of the user. The private key is also used for decrypt and encrypt files, and thus should be present when
  * crypting and decrypting files.
  *
  * @param user The connected user
  * @param password The user's private key
  */
case class UserSession(
  user: User,
  password: String
) extends Session {

  def privateKeyAndSalt: (ByteString, ByteString) =
    (user.security.privateKey(password), user.security.privateKeySalt)

}

object UserSession {

  implicit def userSessionToUser(userSession: UserSession): User =
    userSession.user

  implicit def format: Format[UserSession] =
    Json.format[UserSession]

}

case class SharingSession(
  user: User,
  sharing: Sharing,
  key: ByteString
) extends Session {

  def privateKeyAndSalt: (ByteString, ByteString) =
    (sharing.security.privateKey(key), sharing.security.privateKeySalt)

}



/**
  * An user account
  *
  * @param id The unique ID
  * @param email The mail
  * @param login The login
  * @param security User's security information
  * @param creation The creation date
  * @param roles The roles of the user
  */
case class User(
  id: UUID,
  email: String,
  login: String,
  security: UserSecurity,
  creation: LocalDateTime,
  roles: Seq[String]
) {

  /**
    * Check if the account is an admin account
    *
    * @return True if the user is an admin, false otherwise
    */
  def isAdmin: Boolean = {
    roles.contains("admin")
  }

}

object User {

  def apply(email: String, login: String, password: String): User = {
    User(
      UUID.randomUUID(),
      email,
      login,
      UserSecurity(password),
      LocalDateTime.now,
      Seq[String]("user", "admin") // TODO remove admin :)
    )
  }

  val apiWrite: OWrites[User] =(
    (__ \ "id").write[String] and
    (__ \ "email").write[String] and
    (__ \ "login").write[String] and
    (__ \ "creation").write[LocalDateTime] and
    (__ \ "roles").write[Seq[String]]
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

}

case class UserSecurity(
  encryptedPrivateKey: ByteString,
  privateKeySalt: ByteString,
  salt1: ByteString,
  iv: ByteString,
  passwordHash: ByteString,
  salt2: ByteString
) {

  /**
    * Test if the provided password is the password of the user.
    */
  def checkPassword(toTest: String): Boolean = {
    // To test the password, we need to generate the hash then the second hash, and compare the results
    val toTestHash = Crypto.scrypt(toTest, salt1)
    val toTestHashHash = Crypto.scrypt(toTestHash, salt2)

    toTestHashHash == passwordHash
  }

  /**
    * Decode the private key using the provided password.
    */
  def privateKey(password: String): ByteString = {
    val hash = Crypto.scrypt(password, salt1)
    Crypto.AESDecrypt(hash, iv, encryptedPrivateKey)
  }

  /**
    * Change the password
    */
  def changePassword(previousPassword: String, newPassword: String): UserSecurity = {
    // TODO (decrypt, re-encrypt)
    ???
  }

}

object UserSecurity {

  def apply(password: String): UserSecurity = {
    Security.addProvider(new BouncyCastleProvider)

    // Generate a random 256Bit key
    val privateKey = Crypto.randomBytes(16)
    val privateKeySalt = Crypto.randomBytes(16)

    // Hash of the password to get a 256Bit AES key
    val salt = Crypto.randomBytes(16)
    val passwordHash = Crypto.scrypt(password, salt)

    // Encrypt the hash of the private key
    val iv = Crypto.randomBytes(16)
    val encryptedPrivateKey = Crypto.AESEncrypt(passwordHash, iv, privateKey)

    // Hash the hash of the password
    val salt2 = Crypto.randomBytes(16)
    val passwordHashHash = Crypto.scrypt(passwordHash, salt2)

    UserSecurity(
      encryptedPrivateKey = encryptedPrivateKey,
      privateKeySalt      = privateKeySalt,
      salt1               = salt,
      iv                  = iv,
      passwordHash        = passwordHashHash,
      salt2               = salt2
    )
  }

  implicit def format: Format[UserSecurity] =
    Json.format[UserSecurity]

}
