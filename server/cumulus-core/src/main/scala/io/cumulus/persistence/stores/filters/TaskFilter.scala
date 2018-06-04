package io.cumulus.persistence.stores.filters

import java.time.LocalDateTime

import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.{ParameterizedSqlFilter, QueryFilter}
import io.cumulus.models.task.TaskStatus
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.TaskStore._

/**
  * Filter for tasks.
  *
  * @param status The owner of the session.
  * @param scheduled if the session is revoked.
  */
case class TaskFilter(
  status: TaskStatus,
  scheduled: Option[LocalDateTime] = None
) extends QueryFilter {

  lazy val filters: Seq[ParameterizedSqlFilter] =
    Seq(
      statusToFilter,
      scheduledToFilter,
    ).flatten

  private lazy val statusToFilter: Option[ParameterizedSqlFilter] = Some {
    ParameterizedSqlFilter(s"$statusField = {_status}", "_status", status)
  }

  private lazy val scheduledToFilter: Option[ParameterizedSqlFilter] = scheduled.map { scheduledFilter =>
    ParameterizedSqlFilter(s"($metadataField ->> 'scheduledExecution') >= {_scheduled}", "_scheduled", scheduledFilter)
  }

}


