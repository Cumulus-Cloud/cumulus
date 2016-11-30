package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}

import play.api.libs.functional.syntax._


/**
  * A directory.
  * @param id Its unique UUID
  * @param location The location if composed of the path to the content of the directory (parent location + / + name)
  * @param name The name of the directory, which is actually the last part of its path
  * @param creation The creation date
  * @param modification The last modification date
  * @param creator The creator of the directory
  * @param permissions The permissions
  * @param content The contained directories
  */
case class Directory(
  id: UUID,
  location: Path,
  name: String,
  creation: DateTime,
  modification: DateTime,
  creator: Account,
  permissions: Seq[Permission],
  content: Seq[Directory] // TODO for now only other directories, but will contain files in the future
) extends FileSystemElement {

  /**
    * Check if the directory is the root directory, base on the location being an empty sequence
    * @return True if the directory is the root directory, false otherwise
    */
  def isRoot: Boolean = {
    location.value.isEmpty
  }

}

object Directory {

  def initFrom(location: String, creator: Account): Directory = Directory(
    UUID.randomUUID(),
    location,
    location.split("/").last,
    DateTime.now(),
    DateTime.now(),
    creator,
    permissions = Seq(Permission(creator.id, Seq("read", "write"))),
    content = Seq()
  )

  // TODO add permissions ?
  implicit val directoryWrites: Writes[Directory] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "modification").write[DateTime] and
    (JsPath \ "creator").write[Account] and
    (JsPath \ "content").lazyWriteNullable(Writes.seq[Directory](directoryWrites))
  )(directory => (
    directory.id.toString,
    directory.location.toString,
    directory.name,
    directory.creation,
    directory.modification,
    directory.creator,
    if (directory.content.isEmpty) None else Some(directory.content))
  )

}