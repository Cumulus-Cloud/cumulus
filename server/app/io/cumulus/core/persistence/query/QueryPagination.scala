package io.cumulus.core.persistence.query

case class QueryPagination(limit: Int, offset: Option[Int]) {

  def toLIMIT: String = {
    offset match {
      case Some(o) =>
        s" LIMIT $limit OFFSET $o"
      case None =>
        s" LIMIT $limit"
    }
  }

}
