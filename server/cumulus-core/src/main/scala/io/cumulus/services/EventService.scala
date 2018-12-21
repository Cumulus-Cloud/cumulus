package io.cumulus.services

import io.cumulus.core.Logging
import io.cumulus.core.persistence.query.QueryRunner._
import io.cumulus.core.persistence.query.{QueryE, QueryPagination, QueryRunner}
import io.cumulus.core.utils.PaginatedList
import io.cumulus.core.validation.AppError
import io.cumulus.models.event.Event
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.EventStore
import io.cumulus.persistence.stores.filters.EventFilter
import io.cumulus.persistence.stores.orderings.EventOrdering

import scala.concurrent.Future

class EventService(
  eventStore: EventStore
)(
  implicit
  queryRunner: QueryRunner[Future]
) extends Logging {

  def listEvents(pagination: QueryPagination)(implicit user: User): Future[Either[AppError, PaginatedList[Event]]] = {
    val filter   = EventFilter(user, Seq.empty)
    val ordering = EventOrdering.empty

    QueryE.lift(eventStore.findAll(filter, ordering, pagination)).run()
  }

}
