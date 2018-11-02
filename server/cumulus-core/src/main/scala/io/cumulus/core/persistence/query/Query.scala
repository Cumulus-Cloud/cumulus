package io.cumulus.core.persistence.query

import java.sql.Connection

import io.cumulus.core.Logging
import io.cumulus.core.persistence.CumulusDB

import scala.concurrent.{ExecutionContext, Future}

class FutureQueryRunner(db: CumulusDB, ec: ExecutionContext) extends QueryRunner[Future] with Logging {

  def run[A](query: Query[A], logException: Boolean): Future[A] = {
    val result = Future {
      db.getDB.withConnection(query.atomic)
    }(ec)

    result.foreach {
      case ex: Exception if logException =>
        logger.error(s"Connection failed: ${ex.getMessage}")
        ()
      case _ => ()
    }(ec)

    result
  }

  def commit[A](query: Query[A], logException: Boolean): Future[A] = {
    val result = Future {
      db.getDB.withTransaction(query.atomic)
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

trait QueryRunner[F[_]] {

  def run[A](query: Query[A], logException: Boolean = true): F[A]

  def commit[A](query: Query[A], logException: Boolean = true): F[A]

}

object QueryRunner {

  case class RunnableQuery[F[_], A](query: Query[A], queryRunner: QueryRunner[F]) {

    def run(logException: Boolean = true): F[A] =
      queryRunner.run(query)

    def commit(logException: Boolean = true): F[A] =
      queryRunner.commit(query)

  }

  implicit def toRunnableQuery[F[_], A](query: Query[A])(implicit queryRunner: QueryRunner[F]): RunnableQuery[F, A] = {
    RunnableQuery(query, queryRunner)
  }

  implicit def toRunnableQueryWithConversion[F[_], QueryType, A](query: QueryType)(implicit converter: QueryType =>  Query[A], queryRunner: QueryRunner[F]): RunnableQuery[F, A] = {
    RunnableQuery(converter(query), queryRunner)
  }

}

/**
  * An SQL query monad.
  * 1) Encapsulates and composes query statements to be sent to the database.
  * 2) Enforces the use of a dedicated ExecutionContext.
  */ // TODO
case class Query[+A](atomic: Connection => A) {

  def map[B](f: A => B): Query[B] =
    Query(f compose atomic)

  def flatMap[B](f: A => Query[B]): Query[B] =
    Query(connection => f(atomic(connection)).atomic(connection))

  def zip[B](query: Query[B]): Query[(A, B)] =
    flatMap { a =>
      query.map { b =>
        (a, b)
      }
    }

}

object Query {

  def pure[A](a: A): Query[A] =
    Query(_ => a)

}
