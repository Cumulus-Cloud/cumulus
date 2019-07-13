package io.cumulus.controllers

import cats.data.{EitherT, OptionT}
import io.cumulus.validation.AppError
import play.api.http.DefaultWriteables
import play.api.mvc.{Request, RequestHeader, Result, Results}

import scala.language.implicitConversions
import scala.concurrent.{ExecutionContext, Future}


/**
  * Serialization support add the capabilities to serialize action's results to HTTP results. Only default writers are
  * provided (empty result). This trait should be mixed in with other classes to add serialization to a specific
  * target (JSON, HTML, ...).
  */
trait SerializationSupport extends DefaultWriteables {

  implicit def ec: ExecutionContext

  /** Content type of the serializer. */
  def contentType: String

  /**
    * Defines how a value is serialized to play Result. This a level on top of the usual serialization,
    * because the Resulting is also responsible for the HTTP return code of the result.
    */
  trait Resulting[A] {

    /** Allow to flag resulting handing themselves their content type. */
    val rawContentType: Boolean = false

    /** Converts the value to the result. */
    def toResult(a: A)(implicit req: RequestHeader): Result

  }

  /** Unit serialization (always returns no-content). */
  implicit val ResultingUnit: Resulting[Unit] =
    new Resulting[Unit] {

      def toResult(u: Unit)(implicit req: RequestHeader): Result =
        Results.NoContent // Always no content

    }

  /** Result serialization (returns itself). */
  implicit val ResultingResult: Resulting[Result] =
    new Resulting[Result] {

      /** Do not change the content type that may have been manually set. */
      override val rawContentType: Boolean = true

      def toResult(result: Result)(implicit req: RequestHeader): Result =
        result

    }

  /** Either serialization. Needs a resulting of the left and right. */
  implicit def ResultingEither[E, A](implicit rightResulting: Resulting[A], leftResulting: Resulting[E]): Resulting[Either[E, A]] =
    new Resulting[Either[E, A]] {

      def toResult(value: Either[E, A])(implicit req: RequestHeader): Result =
        value match {
          case Right(validated) =>
            rightResulting.toResult(validated)
          case Left(error) =>
            leftResulting.toResult(error)
        }

    }

  /** Option serialization. Needs a resulting of the contained type. */
  implicit def ResultingOption[A](implicit resulting: Resulting[A]): Resulting[Option[A]] =
    new Resulting[Option[A]] {

      def toResult(value: Option[A])(implicit req: RequestHeader): Result =
        value match {
          case Some(validated) =>
            resulting.toResult(validated)
          case None =>
            Results.NoContent
        }

    }

  /** Main method to convert any future value with a resulting case class to a result. */
  protected def convertToFutureResult[A](value: Future[A], resulting: Resulting[A])(implicit req: RequestHeader) : Future[Result] =
    value
      .map { value =>
        convertToResult(value, resulting)
      }

  /** Main method to convert any value with a resulting case class to a result. */
  protected def convertToResult[A](value: A, resulting: Resulting[A])(implicit req: RequestHeader) : Result =
    resulting.toResult(value)

  /** Wrapper for any asynchronously resolved value that can be converted to a result. */
  class ToFutureResultConverter[A](value: Future[A], resulting: Resulting[A]) {

    def toResult(implicit req: RequestHeader) : Future[Result] =
      convertToFutureResult(value, resulting)

  }

  /** Wrapper for any value that can be converted to a result. */
  class ToResultConverter[A](value: A, resulting: Resulting[A]) {

    def toResult(implicit req: RequestHeader) : Result =
      if (resulting.rawContentType)
        convertToResult(value, resulting) // Do not replace content type
      else
        convertToResult(value, resulting).as(contentType) // Ad our content type

  }

  /** Add implicitly a `toResult` method for any writeable value. */
  implicit def toResultConverter[A](value: A)(implicit resulting: Resulting[A]): ToResultConverter[A] =
    new ToResultConverter[A](value, resulting)

  /** Add implicitly a `toResult` method for any Future of a writeable value. */
  implicit def toFutureResultConverter[A](value: Future[A])(implicit resulting: Resulting[A]): ToFutureResultConverter[A] =
    new ToFutureResultConverter[A](value, resulting)

  /** Add implicitly a `toResult` method for any EitherT value. */
  implicit def toFutureResultConverter[A](value: EitherT[Future, AppError, A])(implicit resulting: Resulting[Either[AppError, A]]): ToFutureResultConverter[Either[AppError, A]] =
    new ToFutureResultConverter[Either[AppError, A]](value.value, resulting)

  /** Add implicitly a `toResult` method for any OptionT value. */
  implicit def toFutureResultConverter[A](value: OptionT[Future, A])(implicit resulting: Resulting[Option[A]]): ToFutureResultConverter[Option[A]] =
    new ToFutureResultConverter[Option[A]](value.value, resulting)

  /** Helper to return an empty result (204) and avoid writing `().toResult`. */
  def EmptyResult(implicit req: Request[_]): Result =
    new ToResultConverter[Unit]((), ResultingUnit).toResult

}
