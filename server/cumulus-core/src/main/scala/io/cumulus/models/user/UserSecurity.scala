package io.cumulus.models.user

import akka.util.ByteString
import io.cumulus.json.JsonFormat._
import io.cumulus.utils.{Base16, Crypto}
import play.api.libs.json.{Format, Json}

/**
  * Security of the user, containing his encrypted global private key.
  *
  * @param encryptedPrivateKey The encrypted global private key.
  * @param salt1 The salt used to generate the SCrypt hash used as the encryption key.
  * @param iv Initialisation vector used with the encryption.
  * @param passwordHash The hash of the hash of the password, kept to test the password used during login.
  * @param salt2 Salt used for the hash of the hash of the password. Because we can't keep the hash of the password,
  *              because this hash is used as the key of the global private key, we keep the hash of the hash of the
  *              password, and thus need two salt (one for the first hash, another for the second).
  * @param validationCode Secret code sent by email, used to validate the email.
  * @param emailValidated If the email has been validated.
  * @param activated If the account is active or not. Account are, by default, active.
  * @param needFirstPassword If the account needs its first password to be usable. A dummy random password will be used.
  */
case class UserSecurity(
  encryptedPrivateKey: ByteString,
  salt1: ByteString,
  iv: ByteString,
  passwordHash: ByteString,
  salt2: ByteString,
  validationCode: ByteString,
  emailValidated: Boolean,
  activated: Boolean,
  needFirstPassword: Boolean
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
    * Check that the provided code is the user's mail code.
    */
  def checkValidationCode(toTest: String): Boolean =
    Base16.decode(toTest).contains(validationCode)

  /**
    * Decode the private key using the provided password.
    */
  def privateKey(password: String): ByteString = {
    val hash = Crypto.scrypt(password, salt1)
    Crypto.AESDecrypt(hash, iv, encryptedPrivateKey)
  }

  def validateEmail: UserSecurity =
    copy(emailValidated = true)

  def activate: UserSecurity =
    copy(activated = true)

  def deactivate: UserSecurity =
    copy(activated = false)

  /**
    * Change the password.
    */
  def changePassword(previousPassword: String, newPassword: String): UserSecurity = {
    // Decrypt the private key
    val previousPasswordHash = Crypto.scrypt(previousPassword, salt1)
    val privateKey = Crypto.AESDecrypt(previousPasswordHash, iv, encryptedPrivateKey)

    // Update the security info
    val updatedSecurity = UserSecurity.create(privateKey, newPassword)

    copy(
      encryptedPrivateKey = updatedSecurity.encryptedPrivateKey,
      salt1               = updatedSecurity.salt1,
      iv                  = updatedSecurity.iv,
      passwordHash        = updatedSecurity.passwordHash,
      salt2               = updatedSecurity.salt2
    )
  }

}

object UserSecurity {

  /**
    * Create a random password with the flag `needFirstPassword` to true.
    */
  def createTemporary: UserSecurity =
    create(Crypto.randomCode(26)).copy(needFirstPassword = true)

  /**
    * Create a security object for a provided clear password.
    * @param password The password of the user.
    */
  def create(password: String): UserSecurity =
    create(
      Crypto.randomBytes(16), // Generate a random 256Bit key
      password
    )

  /**
    * Create a security object for a provided clear password and clear private key.
    * @param password The password of the user.
    * @param privateKey The private key of the user.
    */
  def create(privateKey: ByteString, password: String): UserSecurity = {
    // Hash of the password to get a 256Bit AES key
    val salt = Crypto.randomBytes(16)
    val passwordHash = Crypto.scrypt(password, salt)

    // Encrypt the hash of the private key
    val iv = Crypto.randomBytes(16)
    val encryptedPrivateKey = Crypto.AESEncrypt(passwordHash, iv, privateKey)

    // Hash the hash of the password
    val salt2 = Crypto.randomBytes(16)
    val passwordHashHash = Crypto.scrypt(passwordHash, salt2)

    // Random validation code
    val validationCode = Crypto.randomBytes(16)

    UserSecurity(
      encryptedPrivateKey = encryptedPrivateKey,
      salt1               = salt,
      iv                  = iv,
      passwordHash        = passwordHashHash,
      salt2               = salt2,
      validationCode      = validationCode,
      emailValidated      = false,
      activated           = true,
      needFirstPassword   = false
    )
  }

  implicit val format: Format[UserSecurity] =
    Json.format[UserSecurity]

}
