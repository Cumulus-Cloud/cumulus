package io.cumulus.core.persistence.query

import java.sql.Connection

import scala.language.higherKinds


/**
  * An SQL query monad. Behave like a regular reader monad, and will accumulate transformation based on an SQLConnection.
  * <br/><br/>
  * The Query itself does not handle the running of the query, which is handled by a class implementing the
  * [[io.cumulus.core.persistence.query.QueryRunner QueryRunner]] trait.
  */
case class Query[+A](atomic: Connection => A) {

  /**
    * Map the result of the query to another type.
    *
    * @param f The mapping function.
    */
  def map[B](f: A => B): Query[B] =
    Query(f compose atomic)

  /**
    * Map the result of the query using the result of another query.
    *
    * @param f The mapping function.
    */
  def flatMap[B](f: A => Query[B]): Query[B] =
    Query(connection => f(atomic(connection)).atomic(connection))

  /**
    * Zip two queries together.
    *
    * @param query The other query to be zipped.
    */
  def zip[B](query: Query[B]): Query[(A, B)] =
    flatMap { a =>
      query.map { b =>
        (a, b)
      }
    }

}

object Query {

  /**
    * Create a pure query
    *
    * @param a The static value of the pure query.
    */
  def pure[A](a: A): Query[A] =
    Query(_ => a)

}
