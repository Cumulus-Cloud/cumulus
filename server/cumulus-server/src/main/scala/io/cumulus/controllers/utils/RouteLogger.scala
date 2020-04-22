package io.cumulus.controllers.utils

import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.model.HttpRequest
import akka.http.scaladsl.server.RouteResult.{Complete, Rejected}
import akka.http.scaladsl.server.directives.{DebuggingDirectives, LogEntry, LoggingMagnet}
import akka.http.scaladsl.server.{Route, RouteResult}
import io.cumulus.utils.Logging

object RouteLogger { self: Logging =>

  def log(level: String, route: Route): Route = {
    val logLevel = Logging.levelFor(level) getOrElse Logging.InfoLevel

    def logResponse(loggingAdapter: LoggingAdapter, reqTimestamp: Long)(req: HttpRequest)(res: RouteResult): Unit = {
      val resTimestamp = System.currentTimeMillis()
      val elapsedTime  = resTimestamp - reqTimestamp
      val massage = res match {
        case Complete(response) => s"${req.method.value} ${req.uri} - ${response.status} in ${elapsedTime}ms"
        case Rejected(reasons)  => s"${req.method.value} ${req.uri} - Rejected ${reasons.map(reason => s"$reason").mkString(", ")} in ${elapsedTime}ms"
      }

      LogEntry(massage, logLevel).logTo(loggingAdapter)
    }

    DebuggingDirectives.logRequestResult(LoggingMagnet(logResponse(_, reqTimestamp = System.currentTimeMillis)))(route)
  }

}