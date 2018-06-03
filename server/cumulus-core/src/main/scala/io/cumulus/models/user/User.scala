package io.cumulus.models.user

import java.time.LocalDateTime
import java.util.{Locale, UUID}

import play.api.libs.functional.syntax._
import play.api.libs.json._

/**
  * An user account.
  *
  * @param id The unique ID.
  * @param email The mail.
  * @param login The login.
  * @param security User's security information.
  * @param creation The creation date.
  * @param lang The lang of the user.
  * @param roles The roles of the user.
  */
case class User(
  id: UUID,
  email: String,
  login: String,
  security: UserSecurity,
  creation: LocalDateTime,
  lang: Locale,
  roles: Seq[UserRole]
) {

  /**
    * Check if the account is an admin account.
    *
    * @return True if the user is an admin, false otherwise.
    */
  def isAdmin: Boolean =
    roles.contains(UserRole.Admin)

}

object User {

  /** Creates a new user with default roles. */
  def create(
    email: String,
    login: String,
    password: String,
    lang: Locale
  ): User =
    create(
      email,
      login,
      UserSecurity.create(password),
      lang,
      Seq(UserRole.User)
    )

  /** Creates a new user with the specified information. */
  def create(
    email: String,
    login: String,
    userSecurity: UserSecurity,
    lang: Locale,
    roles: Seq[UserRole]
  ): User =
    User(
      UUID.randomUUID(),
      email,
      login,
      userSecurity,
      LocalDateTime.now,
      lang,
      roles
    )

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
      (__ \ "lang").write[Locale] and
      (__ \ "roles").write[Seq[UserRole]]
    )(user =>
      (
        user.id.toString,
        user.email,
        user.login,
        user.creation,
        user.lang,
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
