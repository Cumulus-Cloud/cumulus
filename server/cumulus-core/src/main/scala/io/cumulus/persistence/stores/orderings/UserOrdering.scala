package io.cumulus.persistence.stores.orderings

import enumeratum.{Enum, EnumEntry}
import io.cumulus.core.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.core.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.UserStore._

import scala.collection.immutable


sealed abstract class UserOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}


object UserOrderingType extends Enum[UserOrderingType] {

  // Note: since we use LocalDateTime, we can use the alphabetical order to sort dates

  case object OrderByCreationAsc  extends UserOrderingType(s"$metadataField ->> 'creation'", ASC)
  case object OrderByCreationDesc extends UserOrderingType(s"$metadataField ->> 'creation'", DESC)

  override val values: immutable.IndexedSeq[UserOrderingType] = findValues

}

case class UserOrdering(
  orders: Seq[UserOrderingType]
) extends QueryOrdering {

  val orderings: Seq[SqlOrdering] =
    orders.map(_.toSqlOrdering)

}

object UserOrdering {

  val empty: UserOrdering =
    UserOrdering(Seq.empty)

  def of(orders: UserOrderingType*): UserOrdering =
    UserOrdering(orders)

}
