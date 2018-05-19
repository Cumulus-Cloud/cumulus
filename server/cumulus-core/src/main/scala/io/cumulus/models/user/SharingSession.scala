package io.cumulus.models.user

import akka.util.ByteString
import io.cumulus.models.sharing.Sharing
import io.cumulus.persistence.storage.StorageReference

/**
  * Sharing session.
  *
  * @param user The connected user.
  * @param sharing The sharing information, containing the node's reference & file encrypted keys.
  * @param key The sharing's private key.
  */
case class SharingSession(
  user: User,
  sharing: Sharing,
  key: ByteString
) extends Session {

  /**
    * Retrieves the secret key of the provided storage reference using the sharing session, if the file is in the
    * sharing session's shared files.
    */
  def privateKeyOfFile(storageReference: StorageReference): Option[ByteString] =
    storageReference.cipher.flatMap(_ => sharing.fileSecurity.get(storageReference.id).map(_.privateKey(key)))

}