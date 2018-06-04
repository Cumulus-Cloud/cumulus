package io.cumulus.persistence.stores.orderings

import enumeratum.{Enum, EnumEntry}
import io.cumulus.core.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.core.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.TaskStore._

import scala.collection.immutable


sealed abstract class TaskOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}


object TaskOrderingType extends Enum[TaskOrderingType] {

  // Note: since we use LocalDateTime, we can use the alphabetical order to sort dates

  case object OrderByCreationAsc  extends TaskOrderingType(s"$metadataField ->> 'creation'", ASC)
  case object OrderByCreationDesc extends TaskOrderingType(s"$metadataField ->> 'creation'", DESC)

  override val values: immutable.IndexedSeq[TaskOrderingType] = findValues

}

case class TaskOrdering(
  orders: Seq[TaskOrderingType]
) extends QueryOrdering {

  val orderings: Seq[SqlOrdering] =
    orders.map(_.toSqlOrdering)

}

object TaskOrdering {

  val empty: TaskOrdering =
    TaskOrdering(Seq.empty)

  def of(orders: TaskOrderingType*): TaskOrdering =
    TaskOrdering(orders)

}
