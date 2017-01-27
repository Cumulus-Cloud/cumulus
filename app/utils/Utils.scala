package utils

import java.security.{MessageDigest, SecureRandom}
import java.util.{Base64, Random}
import javax.crypto.spec.{IvParameterSpec, SecretKeySpec}
import javax.crypto.{Cipher, KeyGenerator, SecretKey}

import akka.util.ByteString

object Utils {

  def encodeBase64(bytes: ByteString): String = encodeBase64(bytes.toArray)

  def encodeBase64(bytes: Array[Byte]): String = {
    ByteString(Base64.getEncoder.encode(bytes)).utf8String
  }

  def decodeBase64(encoded: String): ByteString = {
    ByteString(Base64.getDecoder.decode(encoded.getBytes("UTF-8")))
  }

  object Crypto {

    /**
      * See @java.security.SecureRandom
      */
    implicit val random = new SecureRandom()

    def hash(instance: String)(toHash: String) = {
      MessageDigest.getInstance(instance).digest(toHash.getBytes("UTF-8"))
    }

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

    def createCipher(mode: Int, secretKey: SecretKey, ivBytes: ByteString, algorithm: String) = {
      val cipher = Cipher.getInstance(algorithm)
      val ivSpec = new IvParameterSpec(ivBytes.toArray)
      cipher.init(mode, secretKey, ivSpec)
      cipher
    }

    def createAESCipher(mode: Int, secretKey: SecretKey, ivBytes: ByteString) =
      createCipher(mode, secretKey, ivBytes, "AES/CBC/PKCS5Padding")

    def extractHashAndKey(toDecode: String): Option[(ByteString, ByteString)] = {
      toDecode.split("\\$").toList match {
        case salt64 :: encoded64 :: Nil => Some((decodeBase64(salt64), decodeBase64(encoded64)))
        case _ => None
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
    def decrypt(toDecode: String)(implicit conf: Conf): Option[String] = {
      extractHashAndKey(toDecode) match {
        case Some((salt, encoded)) =>
          val secretKey = new SecretKeySpec(hashSHA1(conf.cryptoKey).slice(0, 16), "AES")
          val cipher = createAESCipher(Cipher.DECRYPT_MODE, secretKey, salt)

          Some(ByteString(cipher.doFinal(encoded.toArray)).utf8String)
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
    def encrypt(toEncode: String)(implicit conf: Conf) = {
      val salt = randomSalt(16)
      val secretKey = new SecretKeySpec(hashSHA1(conf.cryptoKey).slice(0, 16), "AES")
      val cipher = createAESCipher(Cipher.ENCRYPT_MODE, secretKey, salt)

      encodeBase64(salt) + "$" + encodeBase64(cipher.doFinal(toEncode.getBytes("UTF-8")))
    }
  }

}
