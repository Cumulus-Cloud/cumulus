package io.cumulus.core.persistence.query

import io.cumulus.core.persistence.Database
import io.cumulus.core.validation.AppError

import scala.language.implicitConversions

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
case class QueryE[A](query: Query[Either[AppError, A]]) {

  /**
    * Use the provided transformation to change the type of the `ValidatedQuery`, only if the result of the query
    * is `Right`.
    */
  def map[B](f: A => B): QueryE[B] = QueryE {
    query.map(_.map(f))
  }

  /**
    * Combine two queries. If the first fails, the second query will be ignored.
    */
  def flatMap[B](f: A => QueryE[B]): QueryE[B] = QueryE {
    query.flatMap {
      case Right(a) =>
        f(a).query
      case Left(e) =>
        Query(_ => Left(e))
    }
  }

}

object QueryE {

  /**
    * Create a `ValidatedQuery` from a regular query. The created query will always be `Right`.
    */
  def lift[DB <: Database, A](query: Query[A]): QueryE[A] =
    QueryE(query.map(Right.apply))

  def get[DB <: Database, A](query: Query[Option[A]]): QueryE[A] =
    QueryE(query.map(_.toRight(AppError.technical("api-error.internal-server-error"))))

  def getOrNotFound[DB <: Database, A](query: Query[Option[A]]): QueryE[A] =
    QueryE(query.map(_.toRight(AppError.notFound("api-error.not-found"))))

  def getOrNotFound[DB <: Database, A](value: Option[A]): QueryE[A] =
    QueryE(Query.pure(value.toRight(AppError.notFound("api-error.not-found"))))

  /**
    * Create a `ValidatedQuery` from a provided `Either`.
    */
  def pure[DB <: Database, A](either: Either[AppError, A]): QueryE[A] =
    QueryE(Query.pure(either))

  /**
    * Create a `ValidatedQuery` from a provided value. The created query will always be `Right`. Note that a
    * `QueryBuilder` should be available in the scope.
    */
  def pure[DB <: Database, A](value: A): QueryE[A] =
    QueryE(Query.pure(Right(value)))

  /**
    * Create a `ValidatedQuery` from a sequence of queries returning eithers.
    */
  def seq[A](seq: Seq[Query[Either[AppError, A]]]): QueryE[Seq[A]] = {
    QueryE {
      seq match {
        case head :: tail =>
          tail.foldLeft(head.map(_.map(Seq(_)))) {
            case (a, b) =>
              a.flatMap {
                case Right(allSuccess)    => b.map(r => r.map(ra => ra +: allSuccess))
                case Left(existingErrors) => Query.pure(Left(existingErrors)) // Ignore any other query
              }
          }
        case _ =>
          Query.pure(Right(Seq.empty))
      }
    }

  }

  implicit def toQuery[A](queryE: QueryE[A]): Query[Either[AppError, A]] = {
    queryE.query
  }

}
