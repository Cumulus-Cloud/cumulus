package io.cumulus.persistence.query


/**
  * Pagination for an SQL query.
  *
  * @param limit The element limit.
  * @param offset The element offset, defaulted to 0.
  */
case class QueryPagination(limit: Int, offset: Option[Int] = None) {

  def toLIMIT: String = {
    offset match {
      case Some(o) =>
        s" LIMIT $limit OFFSET $o"
      case None =>
        s" LIMIT $limit"
    }
  }

}

object QueryPagination {

  val empty: QueryPagination =
    QueryPagination(0)

  val first: QueryPagination =
    QueryPagination(1)

  def apply(
    maybeLimit: Option[Int],
    maybeOffset: Option[Int]
  )(max: Int, default: Int): QueryPagination =
    maybeLimit
      .map(limit => QueryPagination(if (limit > max) max else limit, maybeOffset))
      .getOrElse(QueryPagination(default, maybeOffset))

}
