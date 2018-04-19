package io.cumulus.core.persistence.anorm

import anorm._
import io.cumulus.core.Logging
import io.cumulus.core.persistence.Database
import io.cumulus.core.persistence.query.{Query, QueryFilter, QueryOrdering, QueryPagination}

/**
 * Abstract class that provides operations based on the private key of the table
 * Functions provided: find, exits, update, delete, upsert.
 * <br/><br/>
 * You must also mixin the trait AnormRepository.
 */
abstract class AnormPKOperations[T, DB <: Database, PK](
  implicit
  pkToStatement: ToStatement[PK]
) extends Logging { self: AnormRepository[T, DB] =>
  def pkField: String

  def find(pk: PK): Query[DB, Option[T]] =
    qb { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$pkField = $pk"
        .as(rowParser.singleOpt)
    }

  def find[Filter <: QueryFilter](pk: PK, filter: Filter): Query[DB, Option[T]] =
    qb { implicit c =>
      SQL(s"SELECT * FROM $table WHERE $pkField = {_pk} ${filter.toAND}")
        .on(NamedParameter("_pk", pk) +: filter.namedParameters: _*)
        .as(rowParser.singleOpt)
    }

  def findAndLock(pk: PK): Query[DB, Option[T]] =
    qb { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$pkField = $pk FOR UPDATE"
        .as(rowParser.singleOpt)
    }

  def findAndLock[Filter <: QueryFilter](pk: PK, filter: Filter): Query[DB, Option[T]] =
    qb { implicit c =>
      SQL(s"SELECT * FROM $table WHERE $pkField = {_pk} ${filter.toAND} FOR UPDATE")
        .on(NamedParameter("_pk", pk) +: filter.namedParameters: _*)
        .as(rowParser.singleOpt)
    }

  def findAll[Filter <: QueryFilter, Ordering <: QueryOrdering](filter: Filter, ordering: Ordering): Query[DB, List[T]] =
    qb { implicit c =>
      SQL(s"SELECT * FROM $table ${filter.toWHERE} ${ordering.toORDER}")
        .on(filter.namedParameters:_*)
        .as(rowParser.*)
    }

  def findAll[Filter <: QueryFilter, Ordering <: QueryOrdering](filter: Filter, ordering: Ordering, pagination: QueryPagination): Query[DB, List[T]] =
    qb { implicit c =>
      SQL(s"SELECT * FROM $table ${filter.toWHERE} ${ordering.toORDER} ${pagination.toLIMIT}")
        .on(filter.namedParameters: _*)
        .as(rowParser.*)
    }

  def exists(pk: PK): Query[DB, Boolean] =
    qb { implicit c =>
      SQL"SELECT EXISTS(SELECT 1 FROM #$table WHERE #$pkField = $pk)"
        .as(SqlParser.scalar[Boolean].single)
    }

  def update(item: T): Query[DB, Int] = {
    val params  = getParams(item)
    val updates = getUpdates(params)

    qb { implicit c =>
      SQL(s"UPDATE $table SET $updates WHERE $pkField = {$pkField}")
        .on(params: _*)
        .executeUpdate()
    }
  }

  def updateBy[A](
    pk: PK
  )(field: String, value: A)(implicit toStmt: ToStatement[A]): Query[DB, Int] =
    qb { implicit c =>
      SQL"UPDATE #$table SET #$field = $value WHERE #$pkField = $pk"
        .executeUpdate()
    }

  def delete(pk: PK): Query[DB, Int] =
    qb { implicit c =>
      SQL"DELETE FROM #$table WHERE #$pkField = $pk"
        .executeUpdate()
    }

  protected def getUpdates(params: Seq[NamedParameter]): String =
    params
      .map(_.name)
      .filterNot(_ == pkField)
      .map { n =>
        val placeholder = s"{$n}"
        s"$n = $placeholder"
      }
      .mkString(", ")
}
