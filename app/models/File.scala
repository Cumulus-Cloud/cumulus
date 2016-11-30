package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}

import play.api.libs.functional.syntax._

/**
  * A File.
  * @param id Its unique UUID
  * @param location The location if composed of the path to the file (container location + / + name)
  * @param name The name of the file, which is actually the last part of its path
  * @param creation The creation date
  * @param modification The last modification date
  * @param creator The creator of the file
  * @param permissions The permissions
  * @param chunks The contained directories
  */
case class File(
  id: UUID,
  location: Path,
  name: String,
  creation: DateTime,
  modification: DateTime,
  creator: Account,
  permissions: Seq[Permission],
  chunks: Seq[String] // TODO
) extends FileSystemElement

object File {

  // TODO
  def initFrom(location: String, creator: Account): File = File(
    UUID.randomUUID(),
    location,
    location.split("/").last,
    DateTime.now(),
    DateTime.now(),
    creator,
    permissions = Seq(Permission(creator.id, Seq("read", "write"))),
    chunks = Seq()
  )

  // TODO add permissions ?
  implicit val fileWrites: Writes[File] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "modification").write[DateTime] and
    (JsPath \ "creator").write[Account] /*and
    (JsPath \ "chunks").lazyWriteNullable(Writes.seq[File](fileWrites))*/ // TODO export chunks
  )(file => (
    file.id.toString,
    file.location.toString,
    file.name,
    file.creation,
    file.modification,
    file.creator
    //if (directory.content.isEmpty) None else Some(directory.content)) // TODO export chunks
    )
  )

}