package io.cumulus.core.persistence.query

import io.cumulus.core.Logging
import io.cumulus.core.persistence.CumulusDB

import scala.concurrent.{ExecutionContext, Future}
import scala.language.{higherKinds, implicitConversions}

/**
  * A Query runner, able to run query to produce a specified effect type of the query's combined result.
  * @tparam F The effect type.
  */
trait QueryRunner[F[_]] {

  /**
    * Run the query, without any SQL transaction between all the statements.
    * @param query The query to be run.
    * @param logException If the runner should log exceptions or not.
    * @tparam A The return type of the query.
    * @return An effect of the query's run, containing the return type of the query.
    */
  def run[A](query: Query[A], logException: Boolean = true): F[A]

  /**
    * Run the query, within an SQL transaction.
    * @param query The query to be run.
    * @param logException If the runner should log exceptions or not.
    * @tparam A The return type of the query.
    * @return An effect of the query's run, containing the return type of the query.
    */
  def commit[A](query: Query[A], logException: Boolean = true): F[A]

}

object QueryRunner {

  /**
    * Implicit conversion case class to make query runnable when a corresponding query runner is implicitly available.
    */
  case class RunnableQuery[F[_], A](query: Query[A], queryRunner: QueryRunner[F]) {

    /**
      * @see [[io.cumulus.core.persistence.query.QueryRunner#run(io.cumulus.core.persistence.query.Query, boolean) QueryRunner.run]]
      */
    def run(logException: Boolean = true): F[A] =
      queryRunner.run(query, logException)

    /**
      * @see [[io.cumulus.core.persistence.query.QueryRunner#commit(io.cumulus.core.persistence.query.Query, boolean) QueryRunner.commit]]
      */
    def commit(logException: Boolean = true): F[A] =
      queryRunner.commit(query, logException)

  }

  implicit def toRunnableQuery[F[_], A](
    query: Query[A]
  )(implicit
    queryRunner: QueryRunner[F]
  ): RunnableQuery[F, A] =
    RunnableQuery(query, queryRunner)

  implicit def toRunnableQueryWithConversion[F[_], QueryType, A](
    query: QueryType
  )(implicit
    converter: QueryType =>  Query[A],
    queryRunner: QueryRunner[F]
  ): RunnableQuery[F, A] =
    RunnableQuery(converter(query), queryRunner)

}

/**
  * Default query runner implementation, using Scala's future to produce asynchronous SQL queries.
  */
class FutureQueryRunner(db: CumulusDB, ec: ExecutionContext) extends QueryRunner[Future] with Logging {

  /**
    * @see [[io.cumulus.core.persistence.query.QueryRunner#run(io.cumulus.core.persistence.query.Query, boolean) QueryRunner.run]]
    */
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

  /**
    * @see [[io.cumulus.core.persistence.query.QueryRunner#commit(io.cumulus.core.persistence.query.Query, boolean) QueryRunner.commit]]
    */
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
