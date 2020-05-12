package io.cumulus.services.tasks

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.task.{OnceTask, Task, TaskExecutionContext, TaskStatus}
import io.cumulus.validation.AppError
import io.cumulus.persistence.storage.StorageReference

import scala.concurrent.Future


/**
  * Task to delete a storage reference.
  */
case class StorageReferenceDeletionTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  storageReference: StorageReference,
  scheduledExecution: Option[LocalDateTime] = None,
  retried: Int = 0,
  // lastError: Option[AppError] = None
) extends OnceTask {

  val name: String = "StorageReferenceDeletionTask"

  def execute(
    implicit context: TaskExecutionContext
  ): Future[Either[AppError, Unit]] =
    context.
      storageService
      .deleteStorageReference(storageReference)

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

object StorageReferenceDeletionTask {

  def create(storageReference: StorageReference): StorageReferenceDeletionTask =
    StorageReferenceDeletionTask(
      UUID.randomUUID,
      TaskStatus.WAITING,
      LocalDateTime.now,
      storageReference
    )

}
