package io.cumulus.models

import java.security.Security
import java.time.LocalDateTime
import java.util.UUID

import akka.util.ByteString
import io.cumulus.core.utils.Crypto._
import io.cumulus.core.utils.{Base64, Crypto}
import org.bouncycastle.jce.provider.BouncyCastleProvider
import play.api.libs.functional.syntax._
import play.api.libs.json.{Format, Json, OWrites, __}

case class Sharing(
  id: UUID,
  reference: String,
  expiration: Option[LocalDateTime],
  owner: UUID,
  fsNode: UUID,
  security: SharingSecurity
)

object Sharing {

  def apply(
    expiration: Option[LocalDateTime],
    owner: UUID,
    fsNode: UUID,
    privateKey: ByteString,
    privateKeySalt: ByteString,
    secretCode: ByteString
  ): Sharing =
    Sharing(
      UUID.randomUUID(),
      Crypto.randomCode(16),
      expiration,
      owner,
      fsNode,
      SharingSecurity(secretCode, privateKey, privateKeySalt)
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

  implicit val format: Format[Sharing] =
    Json.format[Sharing]

}

case class SharingSecurity(
  encryptedPrivateKey: String,
  privateKeySalt: String ,
  salt1: String,
  iv: String,
  secretCodeHash: String,
  salt2: String
) {

  /**
    * Test if the provided secret code is the secret code of the sharing.
    */
  def checkSecretCode(toTest: ByteString): Boolean = {
    // To test the password, we need to generate the hash then the second hash, and compare the results
    val toTestHash = Crypto.scrypt(toTest, Base64.decode(salt1).get)
    val toTestHashHash = Crypto.scrypt(toTestHash, Base64.decode(salt2).get)

    Base64.encode(toTestHashHash) == secretCodeHash
  }

  /**
    * Decode the private key using the provided secret code.
    */
  def privateKey(secredCode: ByteString): ByteString = {
    val hash = Crypto.scrypt(secredCode, Base64.decode(salt1).get)
    Crypto.AESDecrypt(hash, Base64.decode(iv).get, Base64.decode(encryptedPrivateKey).get)
  }

}

object SharingSecurity {

  def apply(secretCode: ByteString, privateKey: ByteString, privateKeySalt: ByteString): SharingSecurity = {
    Security.addProvider(new BouncyCastleProvider)

    // Hash of the secret code to get a 256Bit AES key
    val salt = Crypto.randomBytes(16)
    val secretCodeHash = Crypto.scrypt(secretCode, salt)

    // Encrypt the hash of the private key
    val iv = Crypto.randomBytes(16)
    val encryptedPrivateKey = Crypto.AESEncrypt(secretCodeHash, iv, privateKey)

    // Hash the hash of the secret code
    val salt2 = Crypto.randomBytes(16)
    val secretCodeHashHash = Crypto.scrypt(secretCodeHash, salt2)

    SharingSecurity(
      encryptedPrivateKey = Base64.encode(encryptedPrivateKey),
      privateKeySalt      = Base64.encode(privateKeySalt),
      salt1               = Base64.encode(salt),
      iv                  = Base64.encode(iv),
      secretCodeHash      = Base64.encode(secretCodeHashHash),
      salt2               = Base64.encode(salt2)
    )
  }

  implicit val format: Format[SharingSecurity] =
    Json.format[SharingSecurity]

}
