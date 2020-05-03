package io.cumulus.persistence.query

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry}
import io.cumulus.persistence.query.QueryOrderingDirection.ASC

/**
  * Allow to order a database query.
  */
trait QueryOrdering {

  def toORDER: String = {
    if (orderings.isEmpty)
      ""
    else
      s" ORDER BY ${orderings.map(o => s"${o.sql} ${if(o.direction == ASC) "ASC" else "DESC"}").mkString(" , ")}"
  }

  /**
    * The sequence of orderings defined. Each ordering is defined by some SQL and its associated named parameters.
    */
  def orderings: Seq[SqlOrdering]

}

sealed abstract class QueryOrderingDirection extends EnumEntry

object QueryOrderingDirection extends Enum[QueryOrderingDirection] {

  case object ASC extends QueryOrderingDirection
  case object DESC extends QueryOrderingDirection

  override val values: immutable.IndexedSeq[QueryOrderingDirection] = findValues
}

/**
  * Ordering composing a QueryOrdering.
  *
  * @param sql The SQL part of the ordering. Never add any data passed by the user, and use the `{ }` notation
  *            to use named parameters.
  * @param direction The direction of the sort.
  */
sealed case class SqlOrdering(
  sql: String,
  direction: QueryOrderingDirection = QueryOrderingDirection.ASC
)

