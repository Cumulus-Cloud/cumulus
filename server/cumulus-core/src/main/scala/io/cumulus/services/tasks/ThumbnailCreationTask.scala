package io.cumulus.services.tasks

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.models.fs.File
import io.cumulus.models.user.session.UserSession
import io.cumulus.task.{OnceTask, Task, TaskExecutionContext, TaskStatus}
import io.cumulus.validation.AppError
import io.cumulus.task.TaskExecutionContext._
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.Future

/**
  * Task to delete a storage reference.
  */
case class ThumbnailCreationTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  file: File,
  session: UserSession,
  scheduledExecution: Option[LocalDateTime] = None,
  retried: Int = 0,
  // lastError: Option[AppError] = None
) extends OnceTask {

  val name: String = "ThumbnailCreationTask"

  def execute(
    implicit context: TaskExecutionContext
  ): Future[Either[AppError, Unit]] =
    context
      .storageService
      .generateThumbnail(file)(session)
      .map(_.map(_ => ()))

  def copyTask(
    status: TaskStatus,
    scheduledExecution: Option[LocalDateTime],
    retried: Int,
    lastError: Option[AppError]
  ): Task = copy(
    status = status,
    scheduledExecution = scheduledExecution,
    retried = retried
  )

}

object ThumbnailCreationTask {

  def create(file: File)(implicit session: UserSession): ThumbnailCreationTask =
    ThumbnailCreationTask(
      UUID.randomUUID,
      TaskStatus.WAITING,
      LocalDateTime.now,
      file,
      session
    )

  implicit val format: OFormat[ThumbnailCreationTask] =
    Json.format[ThumbnailCreationTask]

}



