package io.cumulus.models.sharing

import akka.util.ByteString
import io.cumulus.json.JsonFormat._
import io.cumulus.utils.Crypto
import play.api.libs.json.{Format, Json}


/**
  * TODO
  */
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
