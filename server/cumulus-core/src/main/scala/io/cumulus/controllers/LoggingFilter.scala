package io.cumulus.controllers

import akka.stream.Materializer
import play.api.Logger
import play.api.mvc.{Filter, RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

class LoggingFilter(implicit val mat: Materializer, ec: ExecutionContext) extends Filter {

  def apply(nextFilter: RequestHeader => Future[Result])(requestHeader: RequestHeader): Future[Result] = {

    val startTime = System.currentTimeMillis

    nextFilter(requestHeader).map { result =>

      val endTime = System.currentTimeMillis
      val requestTime = endTime - startTime

      Logger.info(s"${requestHeader.method} - ${requestHeader.uri} - ${result.header.status} - ${requestTime}ms")

      result.withHeaders("Request-Time" -> requestTime.toString)
    }
  }

}