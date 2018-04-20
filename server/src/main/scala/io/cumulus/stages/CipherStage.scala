package io.cumulus.stages

import akka.NotUsed
import akka.stream.scaladsl.Flow
import akka.util.ByteString
import io.cumulus.core.stream.utils.AESCipher
import io.cumulus.core.validation.AppError

/**
  * Abstract cipher stage used to encrypt or decrypt a file.
  */
trait CipherStage {

  def name: String

  def encrypt(key: ByteString, salt: ByteString): Flow[ByteString, ByteString, NotUsed]

  def decrypt(key: ByteString, salt: ByteString): Flow[ByteString, ByteString, NotUsed]

}

case class Ciphers(ciphers: Seq[CipherStage]) {

  def get(name: String): Either[AppError, CipherStage] =
    ciphers
      .find(_.name == name.toUpperCase)
      .map(Right.apply)
      .getOrElse(Left(AppError.validation("validation.fs-node.unknown-cipher", name)))

  def get(name: Option[String]): Either[AppError, Option[CipherStage]] =
    name match {
      case Some(n) => get(n).map(Some(_))
      case _       => Right(None)
    }

}

/**
  * Cipher stage using AES/CBC.
  * @see [[io.cumulus.core.stream.utils.AESCipher AESCipher]]
  */
object AESCipherStage extends CipherStage {

  def name: String = "AES"

  def encrypt(key: ByteString, salt: ByteString): Flow[ByteString, ByteString, NotUsed] =
    AESCipher.encrypt(key, salt)

  def decrypt(key: ByteString, salt: ByteString): Flow[ByteString, ByteString, NotUsed] =
    AESCipher.decrypt(key, salt)

}
