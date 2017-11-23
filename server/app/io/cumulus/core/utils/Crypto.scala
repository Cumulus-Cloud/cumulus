package io.cumulus.core.utils

import java.security.SecureRandom
import java.util.Random
import javax.crypto.{Cipher, SecretKey}
import javax.crypto.spec.{IvParameterSpec, SecretKeySpec}

import akka.util.ByteString
import org.bouncycastle.crypto.generators.SCrypt

object Crypto {

  /**
    * See @java.security.SecureRandom
    */
  implicit val random: SecureRandom = new SecureRandom()

  /**
    * Generate a random code of the required size. The code will contains only alphanumerical symbols.
    * @param size The size, in character, of the code
    */
  def randomCode(size: Int): String = {
    val bytes = new Array[Byte](size/2)
    random.nextBytes(bytes)
    Base16.encode(ByteString(bytes))
  }

  /**
    * Generate a Scrypt hash of the provided password.
    *
    * @param password The string of the password to hash
    * @param salt The salt to use
    */
  def scrypt(password: String, salt: ByteString): ByteString =
    scrypt(ByteString(password.getBytes("UTF-8")), salt)

  /**
    * Generate a Scrypt hash of the provided password.
    *
    * @param password The password to hash
    * @param salt The salt to use
    */
  def scrypt(password: ByteString, salt: ByteString): ByteString =
    ByteString(SCrypt.generate(password.toArray, salt.toArray, 32768, 8, 1, 16))

  /**
    * Shorthand to encrypt the provided byte string with the provided key and iv.
    *
    * @param key The key to use
    * @param iv The initialization vector
    * @param toEncrypt The bytes to encrypt
    */
  def AESEncrypt(key: ByteString, iv: ByteString, toEncrypt: ByteString): ByteString = {
    val keySpec = new SecretKeySpec(key.toArray, "AES")
    val cipher = createAESCipher(Cipher.ENCRYPT_MODE, keySpec, iv)

    ByteString(cipher.doFinal(toEncrypt.toArray))
  }

  /**
    * Shorthand to decrypt the provided byte string with the provided key and iv.
    *
    * @param key The key to use
    * @param iv The initialization vector
    * @param toDecrypt The bytes to decrypt
    */
  def AESDecrypt(key: ByteString, iv: ByteString, toDecrypt: ByteString): ByteString = {
    val keySpec = new SecretKeySpec(key.toArray, "AES")
    val cipher = createAESCipher(Cipher.DECRYPT_MODE, keySpec, iv)

    ByteString(cipher.doFinal(toDecrypt.toArray))
  }

  /**
    * Generate a random salt.
    *
    * @param size The size (in number of bytes)
    * @param random The random to use (default is [[java.security.SecureRandom]])
    * @return The salt
    */
  def randomBytes(size: Int)(implicit random: Random): ByteString = {
    val bytes = new Array[Byte](size)
    random.nextBytes(bytes)
    ByteString(bytes)
  }

  /**
    * Helper to create a cipher.
    *
    * @param mode The mode
    * @param secretKey The secret key
    * @param ivBytes The salt / Initialisation vector
    * @param algorithm The algorithm to use
    * @return The created cipher
    */
  def createCipher(mode: Int, secretKey: SecretKey, ivBytes: ByteString, algorithm: String) = {
    val cipher = Cipher.getInstance(algorithm)
    val ivSpec = new IvParameterSpec(ivBytes.toArray)
    cipher.init(mode, secretKey, ivSpec)
    cipher
  }

  /**
    * Helper to create an AES Cipher
    *
    * @param mode The mode to use
    * @param secretKey The secret ke
    * @param ivBytes The salt / Initialisation vector
    * @return The created cipher
    */
  def createAESCipher(mode: Int, secretKey: SecretKey, ivBytes: ByteString) =
    createCipher(mode, secretKey, ivBytes, "AES/CBC/PKCS5Padding")

}
