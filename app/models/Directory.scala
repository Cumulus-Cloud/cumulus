package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}

case class DirectoryPath(value: Seq[String]) {

  import DirectoryPath._

  def parent: DirectoryPath =
    DirectoryPath(value.dropRight(1))

  override def toString =
    convertPathToStr(this)
}

object DirectoryPath {
  implicit def convertPathToStr(directoryPath: DirectoryPath): String =
    "/" + directoryPath.value.mkString("/")

  implicit def convertPathToSeq(directoryPath: DirectoryPath): Seq[String] =
    directoryPath.value

  implicit def convertStringToPath(path: String): DirectoryPath =
    DirectoryPath(path.split("/"))

  implicit def convertSeqToPath(path: Seq[String]): DirectoryPath =
    DirectoryPath(path)
}

case class Directory(
  id: UUID,
  location: DirectoryPath,
  name: String,
  creation: DateTime,
  modification: DateTime,
  creator: Option[Account], // TODO do not use options
  permissions: Seq[DirectoryPermission]
)

case class DirectoryPermission(
  accountId: java.util.UUID,
  permissions: Seq[String]
)

object Directory {


  // TODO
  /*
  implicit val accountWrites: Writes[Account] = (
    (JsPath \ "name").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "modification").write[Seq[String]] and
    (JsPath \ "creator").write[String]
  )(account => (account.mail, account.login, account.creation, account.roles, account.home))*/

}