package io.cumulus.core.persistence.query

import io.cumulus.core.Settings

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

  val empty = QueryPagination(0)

  val first = QueryPagination(1)

  def apply(
    maybeLimit: Option[Int],
    maybeOffset: Option[Int]
  )(implicit settings: Settings): QueryPagination =
    maybeLimit
      .map(limit => QueryPagination(if (limit > settings.api.paginationMaximumSize) settings.api.paginationMaximumSize else limit, maybeOffset))
      .getOrElse(QueryPagination(settings.api.paginationDefaultSize, maybeOffset))

}
