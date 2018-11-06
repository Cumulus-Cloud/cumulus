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
  *    a <- QueryE(Query.pure(Right[AppError, String]("aaa")))
  *    b <- QueryE(Query.pure(Left[AppError, Any](AppError.forbidden("Some error"))))
  *    c <- QueryE(Query.pure(Right[AppError, Int](12)))
  *  } yield (a, c)).query.commit()
  *
  * }
  * }}}
  * The provided `flatMap` and `map` method allow to easily manipulate multiple queries with validation on multiple
  * store, with no need to manually validate the result after each query.
  *
  * @see [[io.cumulus.core.persistence.query.Query Query]]
  * @param query The query to wrap
  */
case class QueryE[A](query: Query[Either[AppError, A]]) {

  /**
    * Use the provided transformation to change the type of the `EQuery`, only if the result of the query
    * is `Right`.
    *
    * @param f The mapping function.
    */
  def map[B](f: A => B): QueryE[B] = QueryE {
    query.map(_.map(f))
  }

  /**
    * Combine two queries. Stops at the first failed query.
    *
    * @param f The mapping function.
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
    * Creates a `QueryE` from a regular query. The created query will always be `Right`.
    */
  def lift[DB <: Database, A](query: Query[A]): QueryE[A] =
    QueryE(query.map(Right.apply))

  /**
    * Creates a `QueryE` from a regular query with an option. If the option is empty, a technical error will be generated.
    * Should be used when the value should always be present.
    */
  def get[DB <: Database, A](query: Query[Option[A]]): QueryE[A] =
    QueryE(query.map(_.toRight(AppError.technical("api-error.internal-server-error"))))

  /**
    * Creates a `QueryE` from a regular query with an option. If the option is empty, a not found error will be generated.
    * Should be used when the value could be absent.
    */
  def getOrNotFound[DB <: Database, A](query: Query[Option[A]]): QueryE[A] =
    QueryE(query.map(_.toRight(AppError.notFound("api-error.not-found"))))

  /**
    * Creates a `QueryE` from an option. If the option is empty, a not found error will be generated. Should be used
    * when the value could be absent.
    */
  def getOrNotFound[DB <: Database, A](value: Option[A]): QueryE[A] =
    QueryE(Query.pure(value.toRight(AppError.notFound("api-error.not-found"))))

  /**
    * Create a `QueryE` from a provided `Either`.
    */
  def pure[DB <: Database, A](either: Either[AppError, A]): QueryE[A] =
    QueryE(Query.pure(either))

  /**
    * Create a `QueryE` from a provided value. The created query will always be `Right`.
    */
  def pure[DB <: Database, A](value: A): QueryE[A] =
    QueryE(Query.pure(Right(value)))

  /**
    * Create a `QueryE` from a sequence of queries returning eithers.
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

  /**
    * Implicit converter to query.
    */
  implicit def toQuery[A](queryE: QueryE[A]): Query[Either[AppError, A]] = {
    queryE.query
  }

}
