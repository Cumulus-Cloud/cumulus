package io.cumulus.models.user

import akka.util.ByteString
import io.cumulus.persistence.storage.StorageReference
import play.api.libs.json.{Format, Json, OFormat}

import scala.language.implicitConversions

/**
  * Session of the user. The private key is also used for decrypt and encrypt files, and thus should be present when
  * crypting and decrypting files.
  *
  * @param user The connected user.
  * @param password The user's private key (password).
  */
case class UserSession(
  user: User,
  password: String
) extends Session {

  /** Private key of the user */
  def privateKey: ByteString =
    user.security.privateKey(password)

  /**
    * Retrieves the secret key of the provided storage reference by decrypting the storage secret key with the user's
    * global private key.
    */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString] =
    storageReference.cipher.map(_.privateKey(user.security.privateKey(password)))

}

object UserSession {

  implicit def userSessionToUser(userSession: UserSession): User =
    userSession.user

  implicit def format: Format[UserSession] ={
    implicit val userFormat: OFormat[User] = User.internalFormat
    Json.format[UserSession]
  }

}
