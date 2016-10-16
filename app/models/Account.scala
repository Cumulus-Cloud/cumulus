package models

import org.joda.time.DateTime
import org.mindrot.jbcrypt.BCrypt

import play.api.libs.json._
import play.api.libs.functional.syntax._

case class Account(
  id: java.util.UUID,
  mail: String,
  login: String,
  password: String,
  creation: DateTime,
  roles: Seq[String],
  home: Option[String]
)

object Account {

  def apply(
    id: String,
    mail: String,
    login: String,
    password: String,
    creation: DateTime,
    roles: Seq[String],
    home: Option[String]
  ): Account = Account(
    java.util.UUID.fromString(id),
    mail,
    login,
    password,
    creation,
    roles,
    home
  )

  def initFrom(mail: String, login: String, password: String): Account = Account(
    java.util.UUID.randomUUID(),
    mail,
    login,
    BCrypt.hashpw(password, BCrypt.gensalt()),
    DateTime.now,
    Seq[String]("user"),
    None
  )

  implicit val accountWrites: Writes[Account] = (
    (JsPath \ "mail").write[String] and
    (JsPath \ "login").write[String] and
    (JsPath \ "creation").write[DateTime] and
    (JsPath \ "roles").write[Seq[String]] and
    (JsPath \ "home").writeNullable[String]
  )(account => (account.mail, account.login, account.creation, account.roles, account.home))

}