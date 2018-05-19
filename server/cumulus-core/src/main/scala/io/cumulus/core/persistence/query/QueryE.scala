package io.cumulus.core.persistence.query

import scala.concurrent.Future

import io.cumulus.core.persistence.Database
import io.cumulus.core.validation.AppError

/**
  * Wrapper allowing to chain easily queries returning a validation (an either):
  * {{{
  * def test(): Future[Either[AppError, (String, Int)]] = {
  *
  *  (for {
  *    a <- ValidatedQuery(qb.pure(Right[AppError, String]("aaa")))
  *    b <- ValidatedQuery(qb.pure(Left[AppError, Any](AppError.forbidden("Some error"))))
  *    c <- ValidatedQuery(qb.pure(Right[AppError, Int](12)))
  *  } yield (a, c)).query.commit()
  *
  * }
  * }}}
  * The provided `flatMap` and `map` method allow to easily manipulate multiple queries with validation on multiple
  * store, with no need to manually validate the result after each query.
  *
  * @param query The query to wrap
  */
case class QueryE[DB <: Database, A](query: Query[DB, Either[AppError, A]]) {

  /**
    * Runs the underlying query.
    * @see [[io.cumulus.core.persistence.query.Query Query]]
    */
  def run(logException: Boolean = true): Future[Either[AppError, A]] = query.run(logException)

  /**
    * Commits the underlying query.
    * @see [[io.cumulus.core.persistence.query.Query Query]]
    */
  def commit(logException: Boolean = true): Future[Either[AppError, A]] = query.commit(logException)

  /**
    * Use the provided transformation to change the type of the `ValidatedQuery`, only if the result of the query
    * is `Right`.
    */
  def map[B](f: A => B): QueryE[DB, B] = QueryE {
    query.map(_.map(f))
  }

  /**
    * Combine two queries. If the first fails, the second query will be ignored.
    */
  def flatMap[B](f: A => QueryE[DB, B]): QueryE[DB, B] = QueryE {
    query.flatMap {
      case Right(a) =>
        f(a).query
      case Left(e) =>
        Query(query.db, query.ec)(_ => Left(e))
    }
  }

}

object QueryE {

  /**
    * Create a `ValidatedQuery` from a regular query. The created query will always be `Right`.
    */
  def lift[DB <: Database, A](query: Query[DB, A]): QueryE[DB, A] =
    QueryE(query.map(Right.apply))

  def get[DB <: Database, A](query: Query[DB, Option[A]]): QueryE[DB, A] =
    QueryE(query.map(_.toRight(AppError.technical("api-error.internal-server-error"))))

  def getOrNotFound[DB <: Database, A](query: Query[DB, Option[A]]): QueryE[DB, A] =
    QueryE(query.map(_.toRight(AppError.notFound("api-error.not-found"))))

  def getOrNotFound[DB <: Database, A](value: Option[A])(implicit qb: QueryBuilder[DB]): QueryE[DB, A] =
    QueryE(qb.pure(value.toRight(AppError.notFound("api-error.not-found"))))

  /**
    * Create a `ValidatedQuery` from a provided `Either`. Note that a `QueryBuilder` should be available in the scope.
    */
  def pure[DB <: Database, A](
    either: Either[AppError, A]
  )(implicit qb: QueryBuilder[DB]): QueryE[DB, A] =
    QueryE(qb.pure(either))

  /**
    * Create a `ValidatedQuery` from a provided value. The created query will always be `Right`. Note that a
    * `QueryBuilder` should be available in the scope.
    */
  def pure[DB <: Database, A](value: A)(implicit qb: QueryBuilder[DB]): QueryE[DB, A] =
    QueryE(qb.pure(Right(value)))

  /**
    * Create a `ValidatedQuery` from a sequence of queries returning eithers.
    */
  def seq[DB <: Database, A](
    seq: Seq[Query[DB, Either[AppError, A]]]
  )(implicit qb: QueryBuilder[DB]): QueryE[DB, Seq[A]] = {
    QueryE {
      seq match {
        case head :: tail =>
          tail.foldLeft(head.map(_.map(Seq(_)))) {
            case (a, b) =>
              a.flatMap {
                case Right(allSuccess)    => b.map(r => r.map(ra => ra +: allSuccess))
                case Left(existingErrors) => qb.pure(Left(existingErrors)) // Ignore any other query
              }
          }
        case _ =>
          qb.pure(Right(Seq.empty))
      }
    }

  }
}
