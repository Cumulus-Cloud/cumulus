package models

import org.joda.time.DateTime
import play.api.libs.json.{JsPath, Writes}

case class Directory(
  id: java.util.UUID,
  location: String,
  name: String,
  creation: DateTime,
  modification: DateTime,
  creator: java.util.UUID,
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