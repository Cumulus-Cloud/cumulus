package io.cumulus.models

import java.time.LocalDateTime
import java.util.UUID
import scala.language.implicitConversions

import akka.util.ByteString
import io.cumulus.core.json.JsonFormat._
import io.cumulus.core.utils.Crypto
import io.cumulus.persistence.storage.StorageReference
import play.api.libs.functional.syntax._
import play.api.libs.json._

/**
  * Common trait for both user session and sharing session
  */
trait Session {

  /** The user of the session. */
  def user: User

  /** Retrieves the secret key of the provided storage reference, if any. */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString]

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

  /** Private key of the user */
  def privateKeyAndSalt: (ByteString, ByteString) =
    (user.security.privateKey(password), user.security.privateKeySalt)

  /** Retrieves the secret key of the provided storage reference, if any. */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString] =
    storageReference.cipher.map(_.privateKey(user.security.privateKey(password)))

}

object UserSession {

  implicit def userSessionToUser(userSession: UserSession): User =
    userSession.user

  implicit def format: Format[UserSession] ={
    implicit val userFormat = User.internalFormat
    Json.format[UserSession]
  }

}

case class SharingSession(
  user: User,
  sharing: Sharing,
  key: ByteString
) extends Session {

  /** Retrieves the secret key of the provided storage reference, if any. */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString] =
    storageReference.cipher.flatMap(_ => sharing.fileSecurity.get(storageReference.id).map(_.privateKey(key)))

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

  def create(email: String, login: String, password: String): User = {
    User(
      UUID.randomUUID(),
      email,
      login,
      UserSecurity(password),
      LocalDateTime.now,
      Seq[String]("user", "admin") // TODO remove admin by default :)
    )
  }

  implicit val reads: Reads[User] = Json.reads[User]

  implicit val writes: OWrites[User] =(
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

  implicit val format: OFormat[User] =
    OFormat(reads, writes)

  // We want different non-implicit writers and readers for the session
  lazy val internalReads: Reads[User]    = reads
  lazy val internalWrites: OWrites[User] = Json.writes[User]
  lazy val internalFormat: OFormat[User] = OFormat(internalReads, internalWrites)

}

/**
  * Security of the user, containing his encrypted global private key.
  * @param encryptedPrivateKey The encrypted global private key.
  * @param privateKeySalt The salt of the private key. TODO delete ?
  * @param salt1 The salt used to generate the SCrypt hash used as the encryption key.
  * @param iv Initialisation vector used with the encryption.
  * @param passwordHash The hash of the hash of the password, kept to test the password used during login.
  * @param salt2 Salt used for the hash of the hash of the password. Because we can't keep the hash of the password,
  *              because this hash is used as the key of the global private key, we keep the hash of the hash of the
  *              password, and thus need two salt (one for the first hash, another for the second).
  */
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
    * Change the password.
    */
  def changePassword(previousPassword: String, newPassword: String): UserSecurity = {
    // TODO (decrypt, re-encrypt)
    ???
  }

}

object UserSecurity {

  /**
    * Create for a new user using the provided clear password.
    * @param password The password of the user.
    */
  def apply(password: String): UserSecurity = {
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
