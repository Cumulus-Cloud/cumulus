package io.cumulus.persistence.stores.orderings

import enumeratum.{Enum, EnumEntry}
import io.cumulus.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.EventStore._

import scala.collection.immutable


sealed abstract class EventOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}


object EventOrderingType extends Enum[EventOrderingType] {

  // Note: since we use LocalDateTime, we can use the alphabetical order to sort dates

  case object OrderByCreationAsc  extends EventOrderingType(creationField, ASC)
  case object OrderByCreationDesc extends EventOrderingType(creationField, DESC)

  override val values: immutable.IndexedSeq[EventOrderingType] = findValues

}

case class EventOrdering(
  orders: Seq[EventOrderingType]
) extends QueryOrdering {

  val orderings: Seq[SqlOrdering] =
    orders.map(_.toSqlOrdering)

}

object EventOrdering {

  val empty: EventOrdering =
    EventOrdering(Seq.empty)

  def of(orders: EventOrderingType*): EventOrdering =
    EventOrdering(orders)

}
