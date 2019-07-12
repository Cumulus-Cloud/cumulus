package io.cumulus.core.controllers.utils.api2

import cats.data.EitherT
import io.cumulus.core.Logging
import io.cumulus.core.validation.{AppError, GlobalError}
import play.api.i18n.{I18nSupport, Messages}
import play.api.mvc.{Request, RequestHeader, Result}

import scala.concurrent.Future
import scala.util.control.NonFatal


/** Add error handling and support (serialization) to a controller supporting serialization. */
trait ErrorSupport extends SerializationSupport with I18nSupport with Logging {

  protected def errorResulting: Resulting[AppError]

  implicit val errorResultingWithLogging: Resulting[AppError] = new Resulting[AppError] {

    override def toResult(appError: AppError)(implicit req: Request[_]): Result = {
      logError(appError, req)
      errorResulting.toResult(appError)
    }

  }

  private def extractEndpoint(request: RequestHeader): String = {
    val method = request.method
    val path = request.path.replace("<[^/]+>", "").replace("$", ":")
    s"$method $path"
  }

  protected def logError(error: AppError, request: RequestHeader): Unit = {
    val localizedMessage = Messages(error.key, error.args: _*)(request2Messages(request))
    val errorMessage = s"Error @${error.id} - $localizedMessage"
    val endpoint = extractEndpoint(request)

    error match {
      // Server error with a cause
      case GlobalError(Some(cause), _, _) if play.api.http.Status.isServerError(error.errorType.status) =>
        logger.error(s"$endpoint - $errorMessage", cause)
      // Server error without a cause
      case _ if play.api.http.Status.isServerError(error.errorType.status) =>
        logger.error(s"$endpoint - $errorMessage")
      // Client error with a cause
      case GlobalError(Some(cause), _, _) =>
        logger.warn(s"$endpoint - $errorMessage", cause)
      // Client error without a cause
      case _ =>
        logger.warn(s"$endpoint - $errorMessage")
    }
  }

  override def convertToFutureResult[A](value: Future[A], resulting: Resulting[A])(implicit req: Request[_]): Future[Result] =
    super.convertToFutureResult(value, resulting)
      .recover { // Error handler to catch unexpected
        case NonFatal(error) =>
          val appError = AppError.technical(error)
          logger.warn(s"${extractEndpoint(req)} - Error @${appError.id} - Unhandled error recovered", error)
          toResultConverter(appError)(errorResultingWithLogging).toResult
        case error =>
          logger.error(s"${extractEndpoint(req)} - Fatal error: ${error.getMessage}", error)
          throw error
      }

  /** Helper with EitherT (our major monad) to implicitly convert it to a result. */
  implicit def toFutureResultHelper(value: EitherT[Future, AppError, Result])(implicit req: Request[_]): Future[Result] =
    new ToFutureResultConverter[Either[AppError, Result]](value.value, ResultingEither[AppError, Result](ResultingResult, errorResultingWithLogging)).toResult

  /** Helper with EitherT (our major monad) to implicitly convert it to a result. */
  implicit def toResultHelper(value: Either[AppError, Result])(implicit req: Request[_]): Result =
    new ToResultConverter[Either[AppError, Result]](value, ResultingEither[AppError, Result](ResultingResult, errorResultingWithLogging)).toResult

}
