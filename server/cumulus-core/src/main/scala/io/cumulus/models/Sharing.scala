package io.cumulus.models

import java.time.LocalDateTime
import java.util.UUID

import akka.util.ByteString
import io.cumulus.core.json.JsonFormat._
import io.cumulus.core.utils.Crypto
import play.api.libs.functional.syntax._
import play.api.libs.json._

case class Sharing(
  id: UUID,
  reference: String,
  expiration: Option[LocalDateTime],
  owner: UUID,
  fsNode: UUID,
  security: SharingSecurity,
  fileSecurity: Map[UUID, FileSharingSecurity]
)

object Sharing {

  def create(
    expiration: Option[LocalDateTime],
    owner: UUID,
    fsNode: UUID,
    security: SharingSecurity,
    fileSecurity: Map[UUID, FileSharingSecurity]
  ): Sharing =
    Sharing(
      UUID.randomUUID(),
      Crypto.randomCode(16),
      expiration,
      owner,
      fsNode,
      security,
      fileSecurity
    )

  val apiWrite: OWrites[Sharing] =(
    (__ \ "id").write[String] and
    (__ \ "reference").write[String] and
    (__ \ "expiration").write[Option[LocalDateTime]] and
    (__ \ "owner").write[String] and
    (__ \ "fsNode").write[String]
  )(sharing =>
    (
      sharing.id.toString,
      sharing.reference,
      sharing.expiration,
      sharing.owner.toString,
      sharing.fsNode.toString
    )
  )

  implicit val format: OFormat[Sharing] =
    OFormat(Json.reads[Sharing], apiWrite)

  val internalFormat: OFormat[Sharing] =
    Json.format[Sharing]

}

case class SharingSecurity(
  secretCodeHash: ByteString,
  salt1: ByteString,
  salt2: ByteString
) {

  /**
    * Test if the provided secret code is the secret code of the sharing.
    */
  def checkSecretCode(toTest: ByteString): Boolean = {
    // To test the password, we need to generate the hash then the second hash, and compare the results
    val toTestHash = Crypto.scrypt(toTest, salt1)
    val toTestHashHash = Crypto.scrypt(toTestHash, salt2)

    toTestHashHash == secretCodeHash
  }

}

object SharingSecurity {

  def create(secretCode: ByteString): SharingSecurity = {
    // Hash of the secret code to get a 256Bit AES key
    val salt = Crypto.randomBytes(16)
    val secretCodeHash = Crypto.scrypt(secretCode, salt)

    // Hash the hash of the secret code
    val salt2 = Crypto.randomBytes(16)
    val secretCodeHashHash = Crypto.scrypt(secretCodeHash, salt2)

    SharingSecurity(
      secretCodeHash = secretCodeHashHash,
      salt1          = salt,
      salt2          = salt2
    )
  }

  implicit val format: Format[SharingSecurity] =
    Json.format[SharingSecurity]

}

case class FileSharingSecurity(
  encryptedPrivateKey: ByteString,
  privateKeySalt: ByteString ,
  salt: ByteString,
  iv: ByteString,
) {

  /**
    * Decode the private key using the provided secret code.
    */
  def privateKey(secredCode: ByteString): ByteString = {
    val hash = Crypto.scrypt(secredCode, salt)
    Crypto.AESDecrypt(hash, iv, encryptedPrivateKey)
  }

}

object FileSharingSecurity {

  def create(secretCode: ByteString, privateKey: ByteString, privateKeySalt: ByteString): FileSharingSecurity = {
    // Hash of the secret code to get a 256Bit AES key
    val salt = Crypto.randomBytes(16)
    val secretCodeHash = Crypto.scrypt(secretCode, salt)

    // Encrypt the hash of the private key
    val iv = Crypto.randomBytes(16)
    val encryptedPrivateKey = Crypto.AESEncrypt(secretCodeHash, iv, privateKey)

    FileSharingSecurity(
      encryptedPrivateKey = encryptedPrivateKey,
      privateKeySalt      = privateKeySalt,
      salt                = salt,
      iv                  = iv
    )
  }

  implicit val format: Format[FileSharingSecurity] =
    Json.format[FileSharingSecurity]

}
