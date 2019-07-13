package io.cumulus.models.sharing

import akka.util.ByteString
import io.cumulus.json.JsonFormat._
import io.cumulus.utils.Crypto
import play.api.libs.json.{Format, Json}


case class FileSharingSecurity(
  encryptedPrivateKey: ByteString,
  privateKeySalt: ByteString ,
  salt: ByteString,
  iv: ByteString,
) {

  /**
    * Decode the private key using the provided secret code.
    */
  def privateKey(secretCode: ByteString): ByteString = {
    val hash = Crypto.scrypt(secretCode, salt)
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
