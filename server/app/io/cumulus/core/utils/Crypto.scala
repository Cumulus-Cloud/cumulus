package io.cumulus.core.utils

import java.security.{MessageDigest, SecureRandom}
import java.util.Random
import javax.crypto.spec.IvParameterSpec
import javax.crypto.{Cipher, KeyGenerator, SecretKey}

import akka.util.ByteString

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
    Base64.encodeBase16(ByteString(bytes))
  }

  /**
    * Helper to generate the hash of a string.
    *
    * @param instance The hash to use
    * @param toHash The string to hash
    * @return The hash
    */
  def hash(instance: String)(toHash: String): ByteString = {
    val hash = MessageDigest.getInstance(instance).digest(toHash.getBytes("UTF-8"))
    ByteString(hash)
  }

  /**
    * Helper to generate a SHA-1 hash of a string.
    *
    * @param toHash The string to hash
    * @return The hash
    */
  def hashSHA1(toHash: String): ByteString =
    hash("SHA-1")(toHash)

  /**
    * Helper to generate a SHA-256 hash of a string.
    *
    * @param toHash The string to hash
    * @return The hash
    */
  def hashSHA256(toHash: String): ByteString =
    hash("SHA-256")(toHash)

  /**
    * Generate a random salt.
    *
    * @param size The size (in number of bytes)
    * @param random The random to use (default is [[java.security.SecureRandom]])
    * @return The salt
    */
  def randomSalt(size: Int)(implicit random: Random): ByteString = {
    val bytes = new Array[Byte](size)
    random.nextBytes(bytes)
    ByteString(bytes.slice(0, 16))
  }

  /**
    * Generate a random secret key.
    *
    * @param algorithm The name of the algorithm
    * @param size The size of the key
    * @param random The random to use (default is @java.security.SecureRandom)
    * @return The generated secret key
    */
  def randomKey(algorithm: String, size: Int)(implicit random: SecureRandom): SecretKey = {
    val generator = KeyGenerator.getInstance(algorithm)
    generator.init(random)
    generator.init(size)
    generator.generateKey()
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
