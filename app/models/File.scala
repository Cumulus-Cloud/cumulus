package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Writes}
import storage.FileStorageEngine

/**
  * A File's metadata
  *
  * @param node The file system node of the file
  * @param metadata The contained directories
  * @param sources The source for the data of the file
  */
case class File(
  node: FsNode,
  metadata: FileMetadata,
  sources: Seq[FileSource]
) extends FsElement

object File {

  val NodeType = "file"

  /**
    * Init a new empty file
    *
    * @param location The file location
    * @param creator The file creator/owner
    * @return The created file
    */
  def initFrom(location: String, creator: Account): File = File(
    FsNode.initFrom(location, "file", creator),
    FileMetadata.default,
    sources = Seq()
  )

  def apply(node: FsNode): File = new File(node, FileMetadata.default, Seq.empty)

}

/**
  * File metadata
  *
  * @param id The id of the file
  * @param size The real size of the file
  * @param hash The real hash of the file
  * @param mimeType The mime type
  */
case class FileMetadata(
  id: UUID,
  size: BigInt,
  hash: String,
  mimeType: String
)

object FileMetadata {

  def default = new FileMetadata(
    UUID.randomUUID(),
    0,
    "d41d8cd98f00b204e9800998ecf8427e", // MD5 of an empty string/file
    "application/octet-stream"
  )

}

/**
  * A file source
 *
  * @param id The file source unique ID
  * @param size The file size in the source (with/out compression and/or cipher)
  * @param hash The MD5 hash of the source file
  * @param cipher The creation date
  * @param compression The creation date
  * @param storageEngine The storage engine used
  * @param storageEngineVersion The storage engine version used
  * @param creation The creation date
  */
case class FileSource(
  id: UUID,
  size: BigInt,
  hash: String,
  cipher: Option[String],
  compression: Option[String],
  key: Option[String],
  storageEngine: String,
  storageEngineVersion: String,
  creation: DateTime
)

object FileSource {

  def initFrom(engine: FileStorageEngine): FileSource = FileSource(
    UUID.randomUUID(),
    0,
    "d41d8cd98f00b204e9800998ecf8427e", // MD5 of an empty string/file
    None,
    None,
    None,
    engine.name,
    engine.version,
    DateTime.now()
  )

  implicit val fileSourceWrites: Writes[FileSource] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "size").write[Int] and
    (JsPath \ "hash").write[String] and
    (JsPath \ "cipher").write[String] and
    (JsPath \ "compression").write[String] and
    (JsPath \ "storageEngine").write[String] and
    (JsPath \ "storageEngineVersion").write[String] and
    (JsPath \ "creation").write[DateTime]
  )(source => (
    source.id.toString,
    source.size.toInt,
    source.hash,
    source.cipher.getOrElse("none"),
    source.compression.getOrElse("none"),
    source.storageEngine,
    source.storageEngineVersion,
    source.creation)
  )
}
