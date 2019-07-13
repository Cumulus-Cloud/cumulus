package io.cumulus.services

import io.cumulus.Logging
import io.cumulus.models.event.Event
import io.cumulus.models.user.User
import io.cumulus.persistence.query.{QueryE, QueryPagination, QueryRunner}
import io.cumulus.persistence.query.QueryRunner._
import io.cumulus.persistence.stores.EventStore
import io.cumulus.persistence.stores.filters.EventFilter
import io.cumulus.persistence.stores.orderings.{EventOrdering, EventOrderingType}
import io.cumulus.utils.PaginatedList
import io.cumulus.validation.AppError

import scala.concurrent.Future


class EventService(
  eventStore: EventStore
)(
  implicit
  queryRunner: QueryRunner[Future]
) extends Logging {

  def listEvents(pagination: QueryPagination)(implicit user: User): Future[Either[AppError, PaginatedList[Event]]] = {
    val filter   = EventFilter(user, Seq.empty)
    val ordering = EventOrdering.of(EventOrderingType.OrderByCreationDesc)

    QueryE.lift(eventStore.findAll(filter, ordering, pagination)).run()
  }

}
