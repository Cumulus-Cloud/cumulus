package io.cumulus.models.user.session

import java.time.temporal.ChronoUnit._
import java.time.{Duration, LocalDateTime}
import java.util.UUID

import io.cumulus.models.user.User
import play.api.libs.json.{Format, Json, OFormat}

/**
  * Common trait for both session types.
  */
sealed trait SessionInformation {

  /** Unique ID of the session */
  def id: UUID

  /** Owner of the sessions */
  def owner: UUID

  /** Creation date of the session. */
  def since: LocalDateTime

  /** Last activity on this session. */
  def lastActivity: LocalDateTime

  /** Number of time this session has been refreshed. */
  def refreshed: Long

  /** Detail of the session's activity. */
  def locations: Seq[SessionLocation]

  /** If the session is expired. An expired session is not usable anymore. */
  def expired: Boolean

  /** If the session has been revoked. A revoked session is not usable anymore. */
  def revoked: Boolean

  /** If the session is still active, i.e. if the user have use this session during the last 15 minutes. */
  lazy val active: Boolean =
    lastActivity.until(LocalDateTime.now, MINUTES) < SessionInformation.activeDuration

  /** Refreshes the information of the session using the provided information. */
  def refresh(from: String): SessionInformation

  /** Revoke the session. */
  def revoke: SessionInformation

}

object SessionInformation {

  /** Duration after the last action the session is still considered active, in minutes. */
  private val activeDuration = 15

  /**
    * Creates an expirable session.
    * @param from The location of the creation.
    * @param duration The duration of the session before expiration.
    */
  def create(from: String, duration: Duration)(implicit user: User): SessionInformation = {
    val now = LocalDateTime.now

    ExpirableSessionInformation(
      id           = UUID.randomUUID,
      owner        = user.id,
      since        = now,
      expire       = now.plus(duration),
      lastActivity = now,
      duration     = duration,
      revoked      = false,
      refreshed    = 0,
      locations    = Seq(
        SessionLocation(
          since   = now,
          to      = now,
          address = from
        )
      )
    )
  }

  /**
    * Creates an infinite session .
    * @param from The location of the creation.
    */
  def createInfinite(from: String)(implicit user: User): SessionInformation = {
    val now = LocalDateTime.now

    InfiniteSessionInformation(
      id           = UUID.randomUUID,
      owner        = user.id,
      since        = now,
      lastActivity = now,
      refreshed    = 0,
      revoked      = false,
      locations    = Seq(
        SessionLocation(
          since   = now,
          to      = now,
          address = from
        )
      )
    )
  }

  implicit val format: OFormat[SessionInformation] =
    Json.format[SessionInformation]

}

/**
  * Expirable session.
  */
case class ExpirableSessionInformation(
  id: UUID,
  owner: UUID,
  since: LocalDateTime,
  expire: LocalDateTime,
  lastActivity: LocalDateTime,
  duration: Duration,
  refreshed: Long,
  revoked: Boolean,
  locations: Seq[SessionLocation]
) extends SessionInformation {

  lazy val expired: Boolean =
    LocalDateTime.now.isAfter(expire)

  def refresh(from: String): ExpirableSessionInformation = {
    val now = LocalDateTime.now

    val updatedLocations =
      locations match {
        case SessionLocation(locationSince, _, address) :: otherLocations if address == from  =>
          SessionLocation(locationSince, now, address) :: otherLocations
        case existingLocations =>
          SessionLocation(now, now, from) +: existingLocations
      }

    copy(
      expire       = now.plus(duration),
      lastActivity = now,
      refreshed    = refreshed + 1,
      locations    = updatedLocations
    )
  }

  def revoke: ExpirableSessionInformation =
    copy(revoked = true)

}

object ExpirableSessionInformation {

  implicit val format: Format[ExpirableSessionInformation] =
    Json.format[ExpirableSessionInformation]

}

/**
  * Infinite session.
  */
case class InfiniteSessionInformation(
  id: UUID,
  owner: UUID,
  since: LocalDateTime,
  lastActivity: LocalDateTime,
  refreshed: Long,
  revoked: Boolean,
  locations: Seq[SessionLocation]
) extends SessionInformation {

  val expired: Boolean =
    false // Never expires

  def refresh(from: String): InfiniteSessionInformation = {
    val now = LocalDateTime.now

    val updatedLocations =
      locations match {
        case SessionLocation(locationSince, _, address) :: otherLocations if address == from  =>
          SessionLocation(locationSince, now, address) :: otherLocations
        case existingLocations =>
          SessionLocation(now, now, from) +: existingLocations
      }

    copy(
      lastActivity = now,
      refreshed    = refreshed + 1,
      locations    = updatedLocations
    )
  }

  def revoke: InfiniteSessionInformation =
    copy(revoked = true)

}

object InfiniteSessionInformation {

  implicit val format: Format[InfiniteSessionInformation] =
    Json.format[InfiniteSessionInformation]

}

/** Session location */
case class SessionLocation(
  since: LocalDateTime,
  to: LocalDateTime,
  address: String
)

object SessionLocation {

  implicit val format: Format[SessionLocation] =
    Json.format[SessionLocation]

}
