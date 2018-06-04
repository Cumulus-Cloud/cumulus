package io.cumulus.models.task

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.validation.AppError
import io.cumulus.services._
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.Future


case class TestRecurrentTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  scheduledExecution: Option[LocalDateTime],
  retried: Int = 0,
  // lastError: Option[AppError] = None
) extends RecurrentTask {

  val name: String = "TestRecurrentTask"

  def copyTask(
    status: TaskStatus,
    scheduledExecution: Option[LocalDateTime],
    retried: Int,
    lastError: Option[AppError]
  ): TestRecurrentTask =
    copy(
      status = status,
      scheduledExecution = scheduledExecution,
      retried = retried,
      //   lastError = lastError
    )

  def execute(
    userService: UserService,
    storageService: StorageService,
    sharingService: SharingService,
    sessionService: SessionService,
    mailService: MailService
  ): Future[Either[AppError, Unit]] = {

    println("I'm the task TestRecurrentTask execution, hello!")
    Future.successful(Right(()))
  }

}

object TestRecurrentTask {

  implicit val format: OFormat[TestRecurrentTask] =
    Json.format[TestRecurrentTask]

}
