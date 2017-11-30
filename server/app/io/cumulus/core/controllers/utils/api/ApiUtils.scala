package io.cumulus.core.controllers.utils.api

import scala.concurrent.{ExecutionContext, Future}

import cats.data.EitherT
import io.cumulus.core.Logging
import io.cumulus.core.validation.{AppError, GlobalError, ValidationError}
import play.api.i18n.I18nSupport
import play.api.libs.json._
import play.api.mvc.{Request, Result, Results}

trait ApiUtils extends Logging with I18nSupport {

  implicit protected val unitWriter: Writes[Unit] = (_: Unit) => JsNull

  protected def toApiError(appError: AppError)(implicit request: Request[_]): Result = appError match {
    case error: GlobalError =>
      ApiError(error.errorType.status, error.key, error.args: _*).toResult
    case error: ValidationError =>
      ApiErrors
        .validationError(
          JsError(
            error.errors.map { e =>
              e.path -> Seq(JsonValidationError(e.key, e.args: _*))
            }.toList
          )
        )
        .toResult
  }

  protected def toResult[R](result: Either[AppError, R])(implicit request: Request[_], writes: Writes[R]): Result =
    result match {
      case Right(()) => Results.NoContent
      case Right(values) =>
        Json.toJson(values) match {
          case JsArray(writtenValues) => ApiList(writtenValues).toResult
          case other                  => Results.Ok(other)
        }

      case Left(error: AppError) => toApiError(error)
    }

  /**
    * Wrapper for API results. The provided result should be a future of either an error or a writable result. The
    * error should be a [[io.cumulus.core.validation.AppError]]
    */
  object ApiResponse {

    /**
      * Transforms an EitherT of AppError and Result into a Result
      */
    def result[REQUEST <: Request[_]](
      result: EitherT[Future, AppError, Result]
    )(
      implicit
      request: REQUEST,
      ec: ExecutionContext
    ): Future[Result] =
      ApiResponse.result(result.value)

    /**
      * Transforms a future of either of AppError and Result into a Result
      */
    def result[REQUEST <: Request[_]](
      result: Future[Either[AppError, Result]]
    )(
      implicit
      request: REQUEST,
      ec: ExecutionContext
    ): Future[Result] = {
      result
        .map(_.left.map(toApiError).merge)
        .recover {
          case e =>
            logger.error("Error while processing request", e)
            ApiErrors.internalServerError.toResult
        }
    }

    /**
      * Transforms an EitherT of AppError and writable into a Result
      */
    def apply[REQUEST <: Request[_], R](
      result: EitherT[Future, AppError, R]
    )(
      implicit
      request: REQUEST,
      writes: Writes[R],
      ec: ExecutionContext
    ): Future[Result] =
      ApiResponse(result.value)

    /**
      * Transforms a future of either of AppError and writable into a Result
      */
    def apply[REQUEST <: Request[_], R](
      result: Future[Either[AppError, R]]
    )(
      implicit
      request: REQUEST,
      writes: Writes[R],
      ec: ExecutionContext
    ): Future[Result] = {
      result
        .map(toResult[R])
        .recover {
          case e =>
            logger.error("Error while processing request", e)
            ApiErrors.internalServerError.toResult
        }
    }

    /**
      * Transforms an either of AppError and writable into a Result
      */
    def apply[REQUEST <: Request[_], R](
      result: Either[AppError, R]
    )(
      implicit
      request: REQUEST,
      writes: Writes[R]
    ): Result = {
      toResult[R](result)
    }

  }

}
