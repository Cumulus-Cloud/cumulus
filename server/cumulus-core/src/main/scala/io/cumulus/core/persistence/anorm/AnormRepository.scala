package io.cumulus.core.persistence.anorm

import anorm._
import io.cumulus.core.persistence.query.{Query, QueryFilter, QueryOrdering, QueryPagination}
import io.cumulus.core.utils.PaginatedList
import io.cumulus.core.utils.PaginatedList._

trait AnormRepository[T] {

  def table: String

  def rowParser: RowParser[T]

  def getParams(item: T): Seq[NamedParameter]

  def create(item: T): Query[Boolean] = {
    val params       = getParams(item)
    val fields       = params.map(_.name)
    val placeholders = fields.map(n => s"{$n}").mkString(", ")

    Query { implicit c =>
      SQL(s"INSERT INTO $table(${fields.mkString(", ")}) VALUES ($placeholders)")
        .on(params: _*)
        .execute()
    }
  }

  def findBy[A](field: String, value: A)(implicit toStmt: ToStatement[A]): Query[Option[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$field = $value"
        .as(rowParser.singleOpt)
    }

  def findAndLockBy[A](
    field: String,
    value: A
  )(implicit toStmt: ToStatement[A]): Query[Option[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$field = $value FOR UPDATE"
        .as(rowParser.singleOpt)
    }

  def findAllAndLock[Filter <: QueryFilter](filter: Filter): Query[Seq[T]] =
    Query { implicit c =>
      SQL(s"SELECT * FROM $table ${filter.toWHERE} FOR UPDATE")
        .on(filter.namedParameters: _*)
        .as(rowParser.*)
    }

  def findAll(): Query[Seq[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table".as(rowParser.*)
    }

  def findAll[Filter <: QueryFilter, Order <: QueryOrdering](filter: Filter, ordering: Order): Query[List[T]] =
    Query { implicit c =>
      SQL(s"SELECT * FROM $table ${filter.toWHERE} ${ordering.toORDER}")
        .on(filter.namedParameters:_*)
        .as(rowParser.*)
    }

  def findAll[Filter <: QueryFilter, Order <: QueryOrdering](filter: Filter, ordering: Order, pagination: QueryPagination): Query[PaginatedList[T]] =
    Query { implicit c =>
      val paginationPlusOne = pagination.copy(limit = pagination.limit + 1)

      val result =
        SQL(s"SELECT * FROM $table ${filter.toWHERE} ${ordering.toORDER} ${paginationPlusOne.toLIMIT}")
          .on(filter.namedParameters: _*)
          .as(rowParser.*)

      result.take(pagination.limit).toPaginatedList(pagination.offset, result.length > pagination.limit)
    }

  def listBy[A](field: String, value: A)(implicit toStmt: ToStatement[A]): Query[Seq[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$field = $value"
        .as(rowParser.*)
    }

  def count(): Query[Long] =
    Query { implicit c =>
      SQL"SELECT COUNT(*) from #$table".as(SqlParser.long(1).single)
    }

  def count[Filter <: QueryFilter](filter: Filter): Query[Long] =
    Query { implicit c =>
      SQL(s"SELECT COUNT(*) from $table ${filter.toWHERE}")
        .on(filter.namedParameters: _*)
        .as(SqlParser.long(1).single)
    }

}
