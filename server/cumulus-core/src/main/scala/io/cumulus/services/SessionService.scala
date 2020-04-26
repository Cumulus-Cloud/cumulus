package io.cumulus.services

import java.time.Duration
import java.util.UUID

import io.cumulus.models.event.{LoginEvent, LogoutEvent}
import io.cumulus.models.user.User
import io.cumulus.models.user.session.{AuthenticationToken, SessionInformation, UserSession}
import io.cumulus.persistence.query.QueryE._
import io.cumulus.persistence.query.QueryRunner._
import io.cumulus.persistence.query.{QueryE, QueryPagination, QueryRunner}
import io.cumulus.persistence.stores.filters.SessionFilter
import io.cumulus.persistence.stores.orderings.SessionOrdering
import io.cumulus.persistence.stores.orderings.SessionOrderingType.OrderByLastActivityDesc
import io.cumulus.persistence.stores.{EventStore, SessionStore, UserStore}
import io.cumulus.utils.{Logging, PaginatedList}
import io.cumulus.validation.AppError
import io.cumulus.Settings

import scala.concurrent.Future


/**
  * Session service, handling session creation, revoking, and management.
  */
class SessionService(
  sessionStore: SessionStore,
  eventStore: EventStore,
  userStore: UserStore
)(
  implicit
  queryRunner: QueryRunner[Future],
  settings: Settings
) extends Logging {

  /**
    * Creates a new session.
    *
    * @param from IP of the call.
    * @param user The user performing the operation.
    */
  def createSession(from: String, user: User): Future[Either[AppError, SessionInformation]] = {
    val newSession = SessionInformation.create(from, Duration.ofNanos(settings.security.sessionDuration.toNanos))(user)

    for {
      // Save the new session
      session <- QueryE.lift(sessionStore.create(newSession).map(_ => newSession))

      // Generate an event
      _ <- QueryE.lift(eventStore.create(LoginEvent.create(from, infinite = false, user)))

    } yield session

  }.commit()

  /**
    * Creates a new infinite session. Infinite session cannot expire and should be manually revoked.
    *
    * @param from IP of the call.
    * @param user The user performing the operation.
    */
  def createInfiniteSession(from: String, user: User): Future[Either[AppError, SessionInformation]] = {
    val newSession = SessionInformation.createInfinite(from)(user)

    for {
      // Save the new session
      session <- QueryE.lift(sessionStore.create(newSession).map(_ => newSession))

      // Generate an event
      _ <- QueryE.lift(eventStore.create(LoginEvent.create(from, infinite = true, user)))

    } yield session

  }.commit()

  /**
    * Retrieves a session.
    */
  def findSession(sessionId: UUID)(implicit user: User): Future[Either[AppError, SessionInformation]] =
    QueryE.getOrNotFound(sessionStore.find(sessionId, SessionFilter(user))).run()

  /**
    * Retrieves a session from the provided token. Will fail if the session is not valid. This method should be used
    * when the session needs to be fetch for each query.
    *
    * @param from IP of the call.
    * @param token The authentication token used.
    */
  def findValidSession(from: String, token: AuthenticationToken): Future[Either[AppError, UserSession]] = {
    for {
      // Retrieve the session
      session <- QueryE.getOrNotFound(sessionStore.find(token.sessionId))

      // Test that the session is still valid and active
      _ <- QueryE.pure {
        if(session.expired)
          Left(AppError.unauthorized("error.validation.user.session-expired"))
        else if (session.revoked)
          Left(AppError.unauthorized("error.validation.user.session-revoked"))
        else
          Right(())
      }

      // Retrieve the user
      user <- QueryE.get(userStore.find(session.owner))

      // Test that the user is accessible
      _ <- QueryE.pure(UserService.checkUsableUser(user))

      // Refresh the session
      refreshedSession =  session.refresh(from)
      _                <- QueryE.lift(sessionStore.update(refreshedSession))

    } yield UserSession(user, refreshedSession, token.password)

  }.commit()

  /**
    * Revokes a session.
    *
    * @param sessionId The ID of the session to revoke.
    * @param from IP of the call.
    */
  def revokeSession(sessionId: UUID, from: String)(implicit user: User): Future[Either[AppError, SessionInformation]] = {

    for {
      // Find the session
      session <- QueryE.getOrNotFound(sessionStore.find(sessionId, SessionFilter(user)))

      // Revoke the session
      revokedSession =  session.revoke
      _              <- QueryE.lift(sessionStore.update(revokedSession))

      // Generate an event
      _ <- QueryE.lift(eventStore.create(LogoutEvent.create(from, user)))

    } yield revokedSession

  }.commit()

  /**
    * Lists the sessions of the user.
    */
  def listSessions(
    pagination: QueryPagination
  )(implicit user: User): Future[Either[AppError, PaginatedList[SessionInformation]]] = {
    val sessionFilter = SessionFilter(owner = user, revoked = None)
    QueryE.lift(sessionStore.findAll(sessionFilter, SessionOrdering.of(OrderByLastActivityDesc), pagination)).run()
  }

}
