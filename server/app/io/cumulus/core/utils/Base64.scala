package io.cumulus.core.utils

import scala.util.Try

import akka.util.ByteString

object Base64 {

  /**
    * Encode in base 64 the provided bytes.
    *
    * @param bytes The bytes to encode
    * @return The encoded bytes
    */
  def encode(bytes: ByteString): String =
    encode(bytes.toArray)

  /**
    * Encode in base 16 the provided bytes, using only `0123456789ABCDEF`.
    *
    * @param bytes The bytes to encode
    * @return The encoded bytes
    */
  def encodeBase16(bytes: ByteString): String = {
    getHex(bytes.toArray)
  }

  private val HEXES = "0123456789ABCDEF"

  private def getHex(raw: Array[Byte]): String = {
    val hex = new StringBuilder(2 * raw.length)
    for (b <- raw) {
      hex.append(HEXES.charAt((b & 0xF0) >> 4)).append(HEXES.charAt(b & 0x0F))
    }
    hex.toString
  }

  /**
    * Encode in base 64 the provided byte array.
    *
    * @param bytes The bytes to encode
    * @return The encoded bytes
    */
  def encode(bytes: Array[Byte]): String =
    ByteString(java.util.Base64.getEncoder.encode(bytes)).utf8String

  /**
    * Decode the provided base 64. If the string can't be decoded, return a `None`.
    *
    * @param encoded The encoded string
    * @return The decoded string as bytes, or nothing
    */
  def decode(encoded: String): Option[ByteString] =
    Try {
      Some(ByteString(java.util.Base64.getDecoder.decode(encoded.getBytes("UTF-8"))))
    } getOrElse None

}
