package io.cumulus.persistence.stores.filters

import java.time.LocalDateTime

import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.{ParameterizedSqlFilter, QueryFilter}
import io.cumulus.models.event.EventType
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.EventStore._

/**
  * Filter for events.
  *
  * @param owner The owner of the events.
  * @param eventTypes Event types of the events.
  */
case class EventFilter(
  owner: User,
  eventTypes: Seq[EventType]
) extends QueryFilter {

  lazy val filters: Seq[ParameterizedSqlFilter] =
    Seq(
      ownerToFilter,
      eventTypesToFilter
    ).flatten

  private lazy val ownerToFilter: Option[ParameterizedSqlFilter] = Some {
    ParameterizedSqlFilter(s"$ownerField = {_owner}", "_owner", owner.id)
  }

  private lazy val eventTypesToFilter: Option[ParameterizedSqlFilter] = eventTypes match {
    case Nil =>
      None
    case _ =>
      Some(ParameterizedSqlFilter(s"$eventTypeField IN {_eventTypes}", "_eventTypes", eventTypes))
  }

}


