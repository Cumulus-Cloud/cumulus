package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.models.user.session.SessionInformation

/**
  * Session store, used to store users' sessions in the database.
  */
class SessionStore extends AnormPKOperations[SessionInformation, UUID] with AnormRepository[SessionInformation] {

  val table: String   = SessionStore.table
  val pkField: String = SessionStore.pkField

  val rowParser: RowParser[SessionInformation] = {
    implicit val sessionColumn: Column[SessionInformation] =
      AnormSupport.column[SessionInformation](SessionInformation.format)

    SqlParser.get[SessionInformation]("metadata")
  }

  def getParams(session: SessionInformation): Seq[NamedParameter] = {
    Seq(
      'id       -> session.id,
      'user_id  -> session.owner,
      'metadata -> SessionInformation.format.writes(session)
    )
  }

}

object SessionStore {

  val table: String = "cumulus_session"

  val pkField: String       = "id"
  val ownerField: String    = "user_id"
  val metadataField: String = "metadata"
  val revokedField: String  = "revoked"

}



