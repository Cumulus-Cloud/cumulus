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
  chunks: Seq[FileChunk]
               // TODO add file metada ? file type ? Number of chunks ?
) extends FsElement

object File {

  val NodeType = "file"

  // TODO init chunks ?
  def initFrom(location: String, creator: Account): File = File(
    FsNode.initFrom(location, "file", creator),
    chunks = Seq()
  )

  def apply(node: FsNode): File = new File(node, Seq.empty)

}

case class FileChunk(
  id: UUID,
  size: BigInt,
  storageEngine: String,
  storageEngineVersion: String,
  creation: DateTime,
  position: Int
)

object FileChunk {

  def initFrom(engine: FileStorageEngine): FileChunk = FileChunk(
    UUID.randomUUID(),
    0,
    engine.name,
    engine.version,
    DateTime.now(),
    0
  )

  implicit val fileChunkWrites: Writes[FileChunk] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "size").write[Int] and
    (JsPath \ "storageEngine").write[String] and
    (JsPath \ "storageEngineVersion").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "position").write[Int]
  )(chunk => (
    chunk.id.toString,
    chunk.size.toInt,
    chunk.storageEngine,
    chunk.storageEngineVersion,
    chunk.creation,
    chunk.position)
  )
}
