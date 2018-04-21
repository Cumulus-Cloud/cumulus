package io.cumulus.core.persistence.query

import java.sql.Connection
import scala.concurrent.{ExecutionContext, Future}

import io.cumulus.core.Logging
import io.cumulus.core.persistence.Database

/**
  * An SQL query monad.
  * 1) Encapsulates and composes query statements to be sent to the database.
  * 2) Enforces the use of a dedicated ExecutionContext.
  */
case class Query[DB <: Database, +A](db: DB, ec: ExecutionContext)(private val atomic: Connection => A)
  extends Logging {

  def map[B](f: A => B): Query[DB, B] =
    Query(db, ec)(f compose atomic)

  def flatMap[B](f: A => Query[DB, B]): Query[DB, B] =
    Query(db, ec)(connection => f(atomic(connection)).atomic(connection))

  def zip[B](query: Query[DB, B]): Query[DB, (A, B)] =
    flatMap { a =>
      query.map { b =>
        (a, b)
      }
    }

  /**
    * For queries which doesn't need to be atomic.
    */
  def run(logException: Boolean = true): Future[A] = {
    val result = Future {
      db.getDB.withConnection(atomic)
    }(ec)

    result.foreach {
      case ex: Exception if logException =>
        logger.error(s"Connection failed: ${ex.getMessage}")
        ()
      case _ => ()
    }(ec)

    result
  }

  /**
    * This is a transaction.
    * Use it instead of run if you have dependant update queries.
    */
  def commit(logException: Boolean = true): Future[A] = {
    val result = Future {
      db.getDB.withTransaction(atomic)
    }(ec)

    result.foreach {
      case ex: Exception if logException =>
        logger.error(s"Transaction failed: ${ex.getMessage}")
        ()
      case _ => ()
    }(ec)

    result
  }

}

object Query {

  def sequence[DB <: Database, A](
    queries: Seq[Query[DB, A]]
  )(implicit qb: QueryBuilder[DB]): Query[DB, Seq[A]] = {
    queries.foldLeft(qb.pure(Seq.empty[A]))(
      (queries, query) =>
        queries.flatMap { seq =>
          query.map(a => seq :+ a)
        }
    )
  }

}
