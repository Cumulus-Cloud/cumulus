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
  chunks: Seq[FileChunk] // TODO chunk object
) extends FsElement

object File {

  val NodeType = "file"

  // TODO init chunks ?
  def initFrom(location: String, creator: Account): File = File(
    FsNode.initFrom(location, "file", creator),
    chunks = Seq()
  )

  // TODO add permissions ?
  // TODO serialize directly fsNode ?
  /*
  implicit val fileWrites: Writes[File] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "modification").write[DateTime] and
    (JsPath \ "creator").write[Account] /*and
    (JsPath \ "chunks").lazyWriteNullable(Writes.seq[String](fileWrites))*/ // TODO export chunks
  )(file => (
    file.node.id.toString,
    file.node.location.toString,
    file.node.name,
    file.node.creation,
    file.node.modification,
    file.node.creator
    //if (file.chunks.isEmpty) None else Some(directory.content)) // TODO export chunks
    )
  )*/

}

case class FileChunk(
  id: UUID,
  size: BigInt,
  storageEngine: String,
  storageEngineVersion: String,
  creation: DateTime
)

object FileChunk {

  def initFrom(engine: FileStorageEngine): FileChunk = FileChunk(
    UUID.randomUUID(),
    0,
    engine.name,
    engine.version,
    DateTime.now()
  )

  implicit val fileChunkWrites: Writes[FileChunk] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "size").write[Int] and
    (JsPath \ "storageEngine").write[String] and
    (JsPath \ "storageEngineVersion").write[String] and
    (JsPath \ "creation").write[DateTime]
  )(chunk => (
    chunk.id.toString,
    chunk.size.toInt,
    chunk.storageEngine,
    chunk.storageEngineVersion,
    chunk.creation)
  )
}
