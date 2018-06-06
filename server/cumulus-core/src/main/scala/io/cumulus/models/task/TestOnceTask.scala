package io.cumulus.models.task

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.validation.AppError
import io.cumulus.services._
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.Future


case class TestOnceTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  scheduledExecution: Option[LocalDateTime],
  retried: Int = 0,
  // lastError: Option[AppError] = None
) extends OnceTask {

  val name: String = "TestOnceTask"

  def copyTask(
    status: TaskStatus,
    scheduledExecution: Option[LocalDateTime],
    retried: Int,
    lastError: Option[AppError]
  ): TestOnceTask =
    copy(
      status = status,
      scheduledExecution = scheduledExecution,
      retried = retried,
      //  lastError = lastError
    )

  def execute(
    userService: UserService,
    storageService: StorageService,
    sharingService: SharingService,
    sessionService: SessionService,
    mailService: MailService
  ): Future[Either[AppError, Unit]] = {
    println(s"Starting task on ${Thread.currentThread.getName}")
    Thread.sleep(3000)
    println(s"Stopping task on ${Thread.currentThread.getName}")
    Future.successful(Right(()))
  }

}

object TestOnceTask {

  implicit val format: OFormat[TestOnceTask] =
    Json.format[TestOnceTask]

}