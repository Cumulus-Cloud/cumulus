package io.cumulus.controllers.utils

import akka.http.scaladsl.server.Rejection
import io.cumulus.validation.AppError

import scala.language.implicitConversions


case class AppErrorRejection(appError: AppError) extends Rejection

object AppErrorRejection {

  implicit class AppErrorRejectable(appError: AppError) {

    def toRejection: AppErrorRejection =
      AppErrorRejection(appError)

  }

  implicit def AppErrorToAppErrorRejection(appError: AppError): AppErrorRejection =
    appError.toRejection

}
