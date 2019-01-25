package io.cumulus.core.persistence.anorm

import anorm._
import io.cumulus.core.Logging
import io.cumulus.core.persistence.query.{Query, QueryFilter}

/**
 * Abstract class that provides operations based on the private key of the table
 * Functions provided: find, exits, update, delete, upsert.
 * <br/><br/>
 * You must also mixin the trait AnormRepository.
 */
abstract class AnormPKOperations[T, PK](
  implicit
  pkToStatement: ToStatement[PK]
) extends Logging { self: AnormRepository[T] =>
  def pkField: String

  def find(pk: PK): Query[Option[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$pkField = $pk"
        .as(rowParser.singleOpt)
    }

  def find[Filter <: QueryFilter](pk: PK, filter: Filter): Query[Option[T]] =
    Query { implicit c =>
      SQL(s"SELECT * FROM $table WHERE $pkField = {_pk} ${filter.toAND}")
        .on(NamedParameter("_pk", pk) +: filter.namedParameters: _*)
        .as(rowParser.singleOpt)
    }

  def findAndLock(pk: PK): Query[Option[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$pkField = $pk FOR UPDATE"
        .as(rowParser.singleOpt)
    }

  def findAndLock[Filter <: QueryFilter](pk: PK, filter: Filter): Query[Option[T]] =
    Query { implicit c =>
      SQL(s"SELECT * FROM $table WHERE $pkField = {_pk} ${filter.toAND} FOR UPDATE")
        .on(NamedParameter("_pk", pk) +: filter.namedParameters: _*)
        .as(rowParser.singleOpt)
    }

  def exists(pk: PK): Query[Boolean] =
    Query { implicit c =>
      SQL"SELECT EXISTS(SELECT 1 FROM #$table WHERE #$pkField = $pk)"
        .as(SqlParser.scalar[Boolean].single)
    }

  def update(item: T): Query[Int] = {
    val params  = getParams(item)
    val updates = getUpdates(params)

    Query { implicit c =>
      SQL(s"UPDATE $table SET $updates WHERE $pkField = {$pkField}")
        .on(params: _*)
        .executeUpdate()
    }
  }

  def upsert(item: T): Query[Int] = {
    val params       = getParams(item)
    val fields       = params.map(_.name)
    val placeholders = fields.map(n => s"{$n}").mkString(", ")
    val updates      = getUpdates(params)

    Query { implicit c =>
      SQL(s"INSERT INTO $table(${fields.mkString(", ")}) VALUES ($placeholders) ON CONFLICT ($pkField) DO UPDATE SET $updates")
        .on(params: _*)
        .executeUpdate()
    }
  }

  def updateBy[A](
    pk: PK
  )(field: String, value: A)(implicit toStmt: ToStatement[A]): Query[Int] =
    Query { implicit c =>
      SQL"UPDATE #$table SET #$field = $value WHERE #$pkField = $pk"
        .executeUpdate()
    }

  def delete(pk: PK): Query[Int] =
    Query { implicit c =>
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
