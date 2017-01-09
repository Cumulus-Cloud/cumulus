package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}
import play.api.libs.functional.syntax._
import storage.FileStorageEngine

/**
  * A File.
  *
  * @param node The file system node of the file
  * @param chunks The contained directories
  */
case class File(
  node: FsNode,
  metadata: FileMetadata,
  chunks: Seq[FileChunk]
               // TODO add file metada ? file type ? Number of chunks ?
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
    chunks = Seq()
  )

  def apply(node: FsNode): File = new File(node, FileMetadata.default, Seq.empty)

}

case class FileMetadata(
  id: UUID,
  size: BigInt,
  mimeType: String
  // TODO other info ?
)

object FileMetadata {
  def default = new FileMetadata(UUID.randomUUID(), 0, "application/octet-stream")

  // Careful, will break if chunks are present multiple times
  // TODO get uniques chunks
  def initFrom(chunks: Seq[FileChunk]) = new FileMetadata(UUID.randomUUID(), chunks.map(_.size).sum, "application/octet-stream")
}

/**
  * A file chunk
 *
  * @param id The file chunk unique ID
  * @param size The file chunk real size
  * @param storageEngine The storage engine used
  * @param storageEngineVersion The storage engine version used
  * @param creation The creation date
  * @param position The chunk position
  * @param hash The MD5 hash of the chunk's content
  */
case class FileChunk(
  id: UUID,
  size: BigInt,
  storageEngine: String,
  storageEngineVersion: String,
  creation: DateTime,
  position: Int,
  compression: Option[String],
  cipher: Option[String],
  hash: String
)

object FileChunk {

  def initFrom(engine: FileStorageEngine): FileChunk = FileChunk(
    UUID.randomUUID(),
    0,
    engine.name,
    engine.version,
    DateTime.now(),
    0,
    None,
    None,
    ""
  )

  implicit val fileChunkWrites: Writes[FileChunk] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "size").write[Int] and
    (JsPath \ "storageEngine").write[String] and
    (JsPath \ "storageEngineVersion").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "position").write[Int] and
    (JsPath \ "hash").write[String]
  )(chunk => (
    chunk.id.toString,
    chunk.size.toInt,
    chunk.storageEngine,
    chunk.storageEngineVersion,
    chunk.creation,
    chunk.position,
    chunk.hash)
  )
}
