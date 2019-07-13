package io.cumulus.persistence.stores.orderings

import enumeratum.{Enum, EnumEntry}
import io.cumulus.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.SessionStore._

import scala.collection.immutable


sealed abstract class SessionOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}


object SessionOrderingType extends Enum[SessionOrderingType] {

  // Note: since we use LocalDateTime, we can use the alphabetical order to sort dates

  case object OrderByLastActivityAsc  extends SessionOrderingType(s"$metadataField ->> 'lastActivity'", ASC)
  case object OrderByLastActivityDesc extends SessionOrderingType(s"$metadataField ->> 'lastActivity'", DESC)
  case object OrderBySinceAsc         extends SessionOrderingType(s"$metadataField ->> 'since'", ASC)
  case object OrderBySinceDesc        extends SessionOrderingType(s"$metadataField ->> 'since'", DESC)

  override val values: immutable.IndexedSeq[SessionOrderingType] = findValues

}

case class SessionOrdering(
  orders: Seq[SessionOrderingType]
) extends QueryOrdering {

  val orderings: Seq[SqlOrdering] =
    orders.map(_.toSqlOrdering)

}

object SessionOrdering {

  val empty: SessionOrdering =
    SessionOrdering(Seq.empty)

  def of(orders: SessionOrderingType*): SessionOrdering =
    SessionOrdering(orders)

}
