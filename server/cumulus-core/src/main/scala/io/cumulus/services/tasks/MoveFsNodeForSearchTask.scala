package io.cumulus.services.tasks

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.models.fs.FsNode
import io.cumulus.task.{OnceTask, Task, TaskExecutionContext, TaskStatus}
import io.cumulus.validation.AppError

import scala.concurrent.Future


case class MoveFsNodeForSearchTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  fsNode: FsNode,
  scheduledExecution: Option[LocalDateTime] = None,
  retried: Int = 0
) extends OnceTask {

  override def name: String = "MoveFsNodeForSearchTask"

  def execute(
    implicit context: TaskExecutionContext
  ): Future[Either[AppError, Unit]] =
    context
      .fsNodeSearchService
      .moveNodeWithChildrenForSearch(fsNode)

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

object MoveFsNodeForSearchTask {

  def create(node: FsNode): MoveFsNodeForSearchTask =
    MoveFsNodeForSearchTask(
      UUID.randomUUID,
      TaskStatus.WAITING,
      LocalDateTime.now,
      node
    )

}
