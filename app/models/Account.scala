package models

import org.joda.time.DateTime
import play.api.libs.json._

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

  def apply(mail: String, login: String, password: String): Account = Account(
    java.util.UUID.randomUUID(),
    mail,
    login,
    password,
    DateTime.now,
    Seq[String]("user"),
    None
  )

  implicit object UserWrites extends OWrites[Account] {
    def writes(account: Account): JsObject = Json.obj(
      "id" -> account.id,
      "mail" -> account.mail,
      "login" -> account.login,
      "password" -> account.password,
      "creation" -> account.creation,
      "roles" -> account.roles
    )
  }

  implicit object UserReads extends Reads[Account] {
    def reads(json: JsValue): JsResult[Account] = json match {
      case obj: JsObject => try {
        val id = (obj \ "id").as[String]
        val mail = (obj \ "mail").as[String]
        val login = (obj \ "login").as[String]
        val password = (obj \ "password").as[String]
        val creation = (obj \ "creation").as[DateTime]
        val roles = (obj \ "roles").as[Seq[String]]
        val home = (obj \ "home").asOpt[String]

        JsSuccess(Account(java.util.UUID.fromString(id), mail, login, password, creation, roles, home))
      } catch {
        case cause: Throwable => JsError(cause.getMessage)
      }

      case _ => JsError("expected.jsobject")
    }
  }

}