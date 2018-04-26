package io.cumulus.persistence.storage

import java.time.LocalDateTime
import java.util.UUID

import akka.util.ByteString
import io.cumulus.core.json.JsonFormat._
import io.cumulus.core.utils.Crypto
import play.api.libs.json.{Format, Json}

/**
  * Storage reference of a file stored on an abstract storage engine. The storage reference will contains one or more
  * storage objects.
  *
  * @param id The unique ID of the chunk
  * @param size The size of the file (uncompressed and not encrypted). This size must be the same as the combined size
  *             of each storage object
  * @param hash The hash of the file (uncompressed and not encrypted)
  * @param cipher The cipher used to encrypt the file. If empty, the file is not encrypted
  * @param compression The compression used on the file. If empty, the file is not compressed
  * @param creation The creation date of the storage reference
  * @param storage The list of storage objects used to store the data of the file
  */
case class StorageReference(
  id: UUID,
  size: Long,
  hash: String,
  cipher: Option[StorageCipher],
  compression: Option[String],
  creation: LocalDateTime,
  storage: Seq[StorageObject]
)

object StorageReference {

  def create(
    size: Long,
    hash: String,
    cipher: Option[StorageCipher],
    compression: Option[String],
    storage: Seq[StorageObject]
  ): StorageReference =
    StorageReference(
      UUID.randomUUID(),
      size,
      hash,
      cipher,
      compression,
      LocalDateTime.now,
      storage
    )

  implicit val format: Format[StorageReference] =
    Json.format[StorageReference]

}

case class StorageCipher(
  cipher: String,
  encryptedPrivateKey: ByteString,
  salt: ByteString,
  iv: ByteString
) {

  /**
    * Decode the private key using the provided password.
    */
  def privateKey(globalPrivateKey: ByteString): ByteString =
    Crypto.AESDecrypt(globalPrivateKey, iv, encryptedPrivateKey)

}

object StorageCipher {

  def create(cipher: String, globalPrivateKey: ByteString) = {

    // Generate the file private key
    val privateKey = Crypto.randomBytes(16)
    val salt       = Crypto.randomBytes(16)

    // Encrypt the hash of the private key
    val iv = Crypto.randomBytes(16)
    val encryptedPrivateKey = Crypto.AESEncrypt(globalPrivateKey, iv, salt)

    StorageCipher(
      cipher,
      encryptedPrivateKey,
      salt,
      iv
    )
  }

  implicit val format: Format[StorageCipher] =
    Json.format[StorageCipher]

}
