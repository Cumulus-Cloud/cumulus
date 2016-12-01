package models

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}

import play.api.libs.functional.syntax._

/**
  * A File.
  * @param node The file system node of the file
  * @param chunks The contained directories
  */
case class File(
  node: FsNode,
  chunks: Seq[String] // TODO chunk object
)

object File {

  // TODO init chunks ?
  def initFrom(location: String, creator: Account): File = File(
    FsNode.initFrom(location, "file", creator),
    chunks = Seq()
  )

  // TODO add permissions ?
  // TODO serialize directly fsNode ?
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
  )

}