package io.cumulus.models.user.session

import akka.util.ByteString
import io.cumulus.models.user.User
import io.cumulus.persistence.storage.StorageReference

/**
  * Common trait for all sessions.
  */
trait Session {

  /** The user of the session. */
  def user: User

  /** Retrieves the secret key of the provided storage reference, if any. */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString]

}

/**
  * Authenticated session have information about the current session.
  */
trait AuthenticatedSession extends Session {

  /** Information on the authenticated session. */
  def information: SessionInformation

}