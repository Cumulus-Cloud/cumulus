package io.cumulus.core.persistence.query

import java.sql.Connection
import scala.collection.generic.CanBuildFrom
import scala.concurrent.ExecutionContext
import scala.language.higherKinds

import io.cumulus.core.persistence.Database

case class QueryBuilder[D <: Database](db: D, ec: ExecutionContext) {

  def pure[A](a: => A): Query[D, A] = Query(db, ec)(_ => a)

  def seq[A](maybeTx: Option[Query[D, A]]): Query[D, Option[A]] =
    maybeTx match {
      case Some(tx) => tx.map(a => Some(a))
      case None     => pure(None)
    }

  def seq[A, F[X] <: TraversableOnce[X]](
    tas: F[Query[D, A]]
  )(implicit cbf: CanBuildFrom[F[Query[D, A]], A, F[A]]): Query[D, F[A]] =
    tas.foldLeft(pure(cbf(tas))) { (tr, ta) =>
      for {
        r <- tr
        a <- ta
      } yield r += a
    } map (_.result())

  def failure[T](ex: Throwable): Query[D, T] = pure[T](throw ex)

  def apply[A](atomic: Connection => A): Query[D, A] = Query(db, ec)(atomic)

}
