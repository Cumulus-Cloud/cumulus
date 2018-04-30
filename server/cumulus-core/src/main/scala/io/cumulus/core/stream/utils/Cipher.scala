package io.cumulus.core.stream.utils

import akka.NotUsed
import akka.stream.scaladsl.Flow
import javax.crypto.spec.SecretKeySpec
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.stream.{Attributes, FlowShape, Inlet, Outlet}
import akka.util.ByteString
import io.cumulus.core.utils.{Base64, Crypto}


/**
  * Crypt a stream of `BytString` using the provided cipher. Any cipher can be used with this method.
  * <br/><br/>
  * According to the nature of the cipher, the data may be streamed by block of varying size even if the data is
  * already streamed in with blocks of different sizes. The behavior is to pull upstream until a block is completed,
  * then push downstream, and repeat for each downstream pull.
  *
  * @param cipher The cipher to use.
  */
class Cipher(cipher: javax.crypto.Cipher) extends GraphStage[FlowShape[ByteString, ByteString]] {

  val in = Inlet[ByteString]("FileCipher.in")
  val out = Outlet[ByteString]("FileCipher.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        val bytes = grab(in)

        if (bytes.isEmpty)
          pull(in) // Should not happen, request more bytes
        else {
          val ciphered = ByteString(cipher.update(bytes.toArray))

          // En/Decryption (e.g. AES with CBC) will work with blocks, if the block is not completed the cipher will
          // return an empty ByteString. We won't send it because it mess up with chucked encoding, so we pull to
          // complete our block and push it when ready
          if(ciphered.nonEmpty)
            push(out, ciphered)
          else
            pull(in)
        }
      }

      override def onUpstreamFinish(): Unit = {
        val bs = ByteString(cipher.doFinal())
        if (bs.nonEmpty)
          emit(out, bs) // Complete if necessary
        complete(out)
      }
    })

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        pull(in)
      }
    })

  }
}

object Cipher {

  /**
    * Crypt a stream of `BytString` using the provided cipher. Any cipher can be used with this method.
    *
    * @param cipher The cipher to use.
    * @see [[io.cumulus.core.stream.utils.Cipher]]
    */
  def apply(cipher: javax.crypto.Cipher): Cipher =
    new Cipher(cipher)

}

/**
  * Helpers to generate AES/CBC cipher/decipher for Flow[FileChunk, FileChunk].
  */
object AESCipher {

  /**
    * Generate an AES/CBC cipher to encrypt a stream.
    *
    * @param key The secret key (in base 64).
    * @param salt The salt (in base 64) (initialization vector bytes).
    * @return A graph stage using the provided key to encrypt the stream.
    */
  def encrypt(
    key: String,
    salt: String
  ): Option[Flow[ByteString, ByteString, NotUsed]] = {
    for {
      keyBytes <- Base64.decode(key)
      saltBytes <- Base64.decode(salt)
    } yield encrypt(keyBytes, saltBytes)
  }

  /**
    * Generate an AES/CBC cipher to encrypt a stream.
    *
    * @param key The secret key.
    * @param salt The salt (initialization vector bytes).
    * @return A graph stage using the provided key to encrypt the stream.
    */
  def encrypt(
    key: ByteString,
    salt: ByteString
  ): Flow[ByteString, ByteString, NotUsed] = {
    val keySpec = new SecretKeySpec(key.toArray, "AES")
    Flow[ByteString].via(Cipher(Crypto.createAESCipher(javax.crypto.Cipher.ENCRYPT_MODE, keySpec, salt)))
  }

  /**
    * Generates an AES/CBC cipher to decrypt a stream.
    *
    * @param key The secret key (in base 64).
    * @param salt The salt (in base 64) (initialization vector bytes).
    * @return A graph stage using the provided key to decrypt the stream.
    */
  def decrypt(
    key: String,
    salt: String
  ): Option[Flow[ByteString, ByteString, NotUsed]] = {
    for {
      keyBytes <- Base64.decode(key)
      saltBytes <- Base64.decode(salt)
    } yield decrypt(keyBytes, saltBytes)
  }

  /**
    * Generates an AES/CBC cipher to decrypt a stream.
    *
    * @param key The secret key.
    * @param salt The salt (initialization vector bytes).
    * @return A graph stage using the provided key to decrypt the stream.
    */
  def decrypt(
    key: ByteString,
    salt: ByteString
  ): Flow[ByteString, ByteString, NotUsed] = {
    val keySpec = new SecretKeySpec(key.toArray, "AES")
    Flow[ByteString].via(Cipher(Crypto.createAESCipher(javax.crypto.Cipher.DECRYPT_MODE, keySpec, salt)))
  }

}