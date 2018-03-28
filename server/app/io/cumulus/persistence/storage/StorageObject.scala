package io.cumulus.persistence.storage

import java.time.LocalDateTime
import java.util.UUID

import play.api.libs.json.{Format, Json}

/**
  * Object (or chunk) of data stored on an abstract storage engine.
  *
  * @param id The unique ID of the chunk
  * @param size The real size (in byte) of the object, with no compression nor encryption
  * @param hash The real hash of the object, with no compression nor encryption
  * @param storageSize The stored size of the object
  * @param storageHash The hash of the stored object
  * @param cipher The cipher used on the object
  * @param compression The compression used on the object
  * @param storageEngine The storage engine used with this object
  * @param storageEngineVersion The version of the storage engine used with this object
  * @param storageEngineReference The reference of the storage engine used with this object
  * @param creation The creation date
  */
case class StorageObject(
  id: UUID,
  size: Long,
  hash: String,
  storageSize: Long,
  storageHash: String,
  cipher: Option[String],
  compression: Option[String],
  storageEngine: String,
  storageEngineVersion: String,
  storageEngineReference: String,
  creation: LocalDateTime
)

object StorageObject {

  /**
    * Create a default storage object for the provided storage engine.
    *
    * @param storageEngine The storage engine to use.
    */
  def create(storageEngine: StorageEngine): StorageObject =
    StorageObject(
      UUID.randomUUID(),
      0,
      "",
      0,
      "",
      None,
      None,
      storageEngine.name,
      storageEngine.version,
      storageEngine.reference,
      LocalDateTime.now
    )

  implicit val format: Format[StorageObject] =
    Json.format[StorageObject]

}
