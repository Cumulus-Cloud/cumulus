package io.cumulus.utils

import scala.util.Try
import akka.util.ByteString
import org.bouncycastle.util.encoders.Hex


object Base16 {

  /**
    * Encode in base 16 the provided bytes.
    *
    * @param bytes The bytes to encode.
    * @return The encoded bytes.
    */
  def encode(bytes: ByteString): String =
    Hex.toHexString(bytes.toArray)

  /**
    * Decode the provided base 16 encoded string. If the string can't be decoded, `None` will be returned.
    *
    * @param encoded The encoded string.
    * @return The decoded string as bytes, or nothing.
    */
  def decode(encoded: String): Option[ByteString] =
    Try {
      Some(ByteString(Hex.decode(encoded)))
    } getOrElse None

}

object Base64 {

  /**
    * Encode in base 64 the provided bytes.
    *
    * @param bytes The bytes to encode.
    * @return The encoded bytes.
    */
  def encode(bytes: ByteString): String =
    encode(bytes.toArray)

  /**
    * Encode in base 64 the provided byte array.
    *
    * @param bytes The bytes to encode.
    * @return The encoded bytes.
    */
  def encode(bytes: Array[Byte]): String =
    ByteString(java.util.Base64.getEncoder.encode(bytes)).utf8String

  /**
    * Decode the provided base 64 encoded string. If the string can't be decoded, `None` will be returned.
    *
    * @param encoded The encoded string.
    * @return The decoded string as bytes, or nothing.
    */
  def decode(encoded: String): Option[ByteString] =
    Try {
      Some(ByteString(java.util.Base64.getDecoder.decode(encoded.getBytes("UTF-8"))))
    } getOrElse None

}
