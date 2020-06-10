package io.cumulus.services.tasks

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.models.fs.FsNode
import io.cumulus.task.{OnceTask, Task, TaskExecutionContext, TaskStatus}
import io.cumulus.validation.AppError

import scala.concurrent.Future


case class RemoveFsNodeForSearchTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  fsNode: FsNode,
  children: Boolean,
  scheduledExecution: Option[LocalDateTime] = None,
  retried: Int = 0
) extends OnceTask {

  override def name: String = "RemoveFsNodeForSearchTask"

  def execute(
    implicit context: TaskExecutionContext
  ): Future[Either[AppError, Unit]] =
    if (children)
      context.fsNodeSearchService
        .removeNodeWithChildrenForSearch(parent = fsNode)
    else
      context.fsNodeSearchService
        .removeNodeForSearch(fsNode = fsNode)

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

object RemoveFsNodeForSearchTask {

  def create(node: FsNode, withContent: Boolean): RemoveFsNodeForSearchTask =
    RemoveFsNodeForSearchTask(
      UUID.randomUUID,
      TaskStatus.WAITING,
      LocalDateTime.now,
      node,
      withContent
    )

}

