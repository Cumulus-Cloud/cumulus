package io.cumulus.models.user

import java.time.LocalDateTime
import java.util.UUID

import play.api.libs.functional.syntax._
import play.api.libs.json._

/**
  * An user account
  *
  * @param id The unique ID
  * @param email The mail
  * @param login The login
  * @param security User's security information
  * @param creation The creation date
  * @param roles The roles of the user
  */
case class User(
  id: UUID,
  email: String,
  login: String,
  security: UserSecurity,
  creation: LocalDateTime,
  roles: Seq[UserRole]
) {

  /**
    * Check if the account is an admin account
    *
    * @return True if the user is an admin, false otherwise
    */
  def isAdmin: Boolean = {
    roles.contains(UserRole.Admin)
  }

}

object User {

  def create(email: String, login: String, password: String): User = {
    User(
      UUID.randomUUID(),
      email,
      login,
      UserSecurity.create(password),
      LocalDateTime.now,
      Seq(UserRole.User)
    )
  }

  def createAdministrator(email: String, login: String, password: String): User = {
    val user = create(email, login, password)

    user
      .copy(roles = Seq(UserRole.User, UserRole.Admin))
      .copy(security = user.security.copy(emailValidated = true)) // Email always validated to admins
  }

  implicit val reads: Reads[User] = Json.reads[User]

  implicit val writes: OWrites[User] =
    (
      (__ \ "id").write[String] and
      (__ \ "email").write[String] and
      (__ \ "login").write[String] and
      (__ \ "creation").write[LocalDateTime] and
      (__ \ "roles").write[Seq[UserRole]]
    )(user =>
      (
        user.id.toString,
        user.email,
        user.login,
        user.creation,
        user.roles
      )
    )

  implicit val format: OFormat[User] =
    OFormat(reads, writes)

  // We want different non-implicit writers and readers for the session
  lazy val internalReads: Reads[User]    = reads
  lazy val internalWrites: OWrites[User] = Json.writes[User]
  lazy val internalFormat: OFormat[User] = OFormat(internalReads, internalWrites)

}
