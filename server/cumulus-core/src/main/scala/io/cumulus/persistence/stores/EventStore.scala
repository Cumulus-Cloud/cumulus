package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.models.event.Event


/**
  * Event store, used to manage user event.
  */
class EventStore extends AnormPKOperations[Event, UUID] with AnormRepository[Event] {

  val table: String   = EventStore.table
  val pkField: String = EventStore.pkField

  val rowParser: RowParser[Event] = {
    implicit val userColumn: Column[Event] =
      AnormSupport.column[Event](Event.format)

    SqlParser.get[Event](EventStore.metadataField)
  }

  def getParams(event: Event): Seq[NamedParameter] = {
    Seq(
      EventStore.pkField        -> event.id,
      EventStore.ownerField     -> event.owner,
      EventStore.eventTypeField -> event.eventType,
      EventStore.metadataField  -> Event.format.writes(event)
    )
  }

}

object EventStore {

  val table: String = "cumulus_event"

  val pkField: String        = "id"
  val ownerField: String     = "user_id"
  val eventTypeField: String = "event_type"
  val metadataField: String  = "metadata"

}
