package io.cumulus.core.persistence.anorm

import anorm._
import io.cumulus.core.persistence.query._

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

  def listBy[A](field: String, value: A)(implicit toStmt: ToStatement[A]): Query[Seq[T]] =
    Query { implicit c =>
      SQL"SELECT * FROM #$table WHERE #$field = $value"
        .as(rowParser.*)
    }

  def count(): Query[Long] =
    Query { implicit c =>
      SQL"SELECT COUNT(*) from #$table".as(SqlParser.long(1).single)
    }

}
