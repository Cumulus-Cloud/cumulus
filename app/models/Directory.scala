package models

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}

import play.api.libs.functional.syntax._

/**
  * A directory
  * @param node The file system node of the directory
  * @param content The contained directories
  */
case class Directory(
  node: FsNode,
  content: Seq[Directory] // TODO for now only other directories, but will contain files in the future
) extends FsElement

object Directory {

  def initFrom(location: String, creator: Account): Directory = Directory(
    FsNode.initFrom(location, "directory", creator),
    Seq.empty
  )

  def apply(node: FsNode): Directory = new Directory(node, Seq.empty)

  // TODO add permissions ?
  // TODO serialize directly fsNode ?
  implicit val directoryWrites: Writes[Directory] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "modification").write[DateTime] and
    (JsPath \ "creator").write[Account] and
    (JsPath \ "content").lazyWriteNullable(Writes.seq[Directory](directoryWrites))
  )(directory => (
    directory.node.id.toString,
    directory.node.location.toString,
    directory.node.name,
    directory.node.creation,
    directory.node.modification,
    directory.node.creator,
    if (directory.content.isEmpty) None else Some(directory.content))
  )

}