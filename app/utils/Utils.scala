package utils

import java.security.{MessageDigest, SecureRandom}
import java.util.{Base64, Random}
import javax.crypto.spec.{IvParameterSpec, SecretKeySpec}
import javax.crypto.{Cipher, KeyGenerator, SecretKey}

import akka.util.ByteString

import scala.util.Try

object Utils {

  /**
    * Encode in base 64 the provided bytes
    *
    * @param bytes The bytes to encode
    * @return The encoded bytes
    */
  def encodeBase64(bytes: ByteString): String = encodeBase64(bytes.toArray)

  /**
    * Encode in base 64 the provided byte array
    *
    * @param bytes The bytes to encode
    * @return The encoded bytes
    */
  def encodeBase64(bytes: Array[Byte]): String = {
    ByteString(Base64.getEncoder.encode(bytes)).utf8String
  }

  /**
    * Decode the provided base 64. If the string can"t be decoded, return a None
 *
    * @param encoded The encoded string
    * @return The decoded string as bytes, or nothin
    */
  def decodeBase64(encoded: String): Option[ByteString] = {
    Try(Some(ByteString(Base64.getDecoder.decode(encoded.getBytes("UTF-8"))))).getOrElse(None)
  }

  object Crypto {

    /**
      * See @java.security.SecureRandom
      */
    implicit val random = new SecureRandom()

    /**
      * Helper to generate the hash of a string
      *
      * @param instance The hash to use
      * @param toHash The string to hash
      * @return The hash
      */
    def hash(instance: String)(toHash: String) = {
      MessageDigest.getInstance(instance).digest(toHash.getBytes("UTF-8"))
    }

    /**
      * Helper to generate a SHA-1 hash of a string
      *
      * @param toHash The string to hash
      * @return The hash
      */
    def hashSHA1(toHash: String) = hash("SHA-1")(toHash)

    /**
      * Generate a random salt
      *
      * @param size The size (in number of bytes)
      * @param random The random to use (default is @java.security.SecureRandom)
      * @return The salt
      */
    def randomSalt(size: Int)(implicit random: Random) = {
      val bytes = new Array[Byte](size)
      random.nextBytes(bytes)
      ByteString(bytes.slice(0, 16))
    }

    /**
      * Generate a random secret key
      *
      * @param algorithm The name of the algorithm
      * @param size The size of the key
      * @param random The random to use (default is @java.security.SecureRandom)
      * @return The generated secret key
      */
    def randomKey(algorithm: String, size: Int)(implicit random: Random) = {
      val generator = KeyGenerator.getInstance(algorithm)
      generator.init(Utils.Crypto.random)
      generator.init(size)
      generator.generateKey()
    }

    /**
      * Helper to create a cipher
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

    private def extractHashAndKey(toDecode: String): Option[(ByteString, ByteString)] = {
      toDecode.split("\\$").toList match {
        case salt64 :: encoded64 :: Nil =>
          (decodeBase64(salt64), decodeBase64(encoded64)) match {
            case (Some(salt), Some(key)) => Some((salt, key) )
            case _ => None // Base 64 decoding failed
          }
        case _ => None // Not the right format
      }
    }

    /**
      * Decrypt the provided message using the secret key defined in the configuration file. This is made to ensure that
      * the database alone can't be enough to decrypt the files
      *
      * @param toDecode The string to decode. The string should be of the form salt$cipheredMessage
      * @param conf The configuration, containing the secret key
      * @return The decoded message, or none if the message is malformed
      */
    def decrypt(toDecode: String)(implicit conf: Conf): Option[ByteString] = {
      extractHashAndKey(toDecode) match {
        case Some((salt, encoded)) =>
          val secretKey = new SecretKeySpec(hashSHA1(conf.cryptoKey).slice(0, 16), "AES")
          val cipher = createAESCipher(Cipher.DECRYPT_MODE, secretKey, salt)

          Some(ByteString(cipher.doFinal(encoded.toArray)))
        case _ => None
      }
    }

    /**
      * Encrypt the provided string with the secret key defined in the configuration file. This is made to ensure that
      * the database alone can't be enough to decrypt the files
      *
      * @param toEncode The string to encode
      * @param conf The configuration, containing the secret key
      * @return The ciphered key, using AES, with a generated salt (salt$cipheredMessage)
      */
    def encrypt(toEncode: ByteString)(implicit conf: Conf): String = {
      val salt = randomSalt(16)
      val secretKey = new SecretKeySpec(hashSHA1(conf.cryptoKey).slice(0, 16), "AES")
      val cipher = createAESCipher(Cipher.ENCRYPT_MODE, secretKey, salt)

      encodeBase64(salt) + "$" + encodeBase64(cipher.doFinal(toEncode.toArray))
    }
  }

}
