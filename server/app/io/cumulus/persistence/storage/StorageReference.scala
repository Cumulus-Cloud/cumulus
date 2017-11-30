package io.cumulus.persistence.storage

import java.time.LocalDateTime
import java.util.UUID

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
  cipher: Option[String],
  compression: Option[String],
  creation: LocalDateTime,
  storage: Seq[StorageObject]
)

object StorageReference {

  def apply(
    size: Long,
    hash: String,
    cipher: Option[String],
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
