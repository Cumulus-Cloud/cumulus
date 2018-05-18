package io.cumulus.models.user

import akka.util.ByteString
import io.cumulus.persistence.storage.StorageReference

/**
  * Common trait for both user session and sharing session
  */
trait Session {

  /** The user of the session. */
  def user: User

  /** Retrieves the secret key of the provided storage reference, if any. */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString]

}
