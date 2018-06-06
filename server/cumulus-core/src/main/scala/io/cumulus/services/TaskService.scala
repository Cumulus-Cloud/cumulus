package io.cumulus.services

import java.time.LocalDateTime

import io.cumulus.core.Logging
import io.cumulus.core.persistence.query.QueryE
import io.cumulus.core.validation.AppError
import io.cumulus.models.task.{OnceTask, RecurrentTask, Task, TaskStatus}
import io.cumulus.persistence.stores.TaskStore
import io.cumulus.persistence.stores.filters.TaskFilter
import io.cumulus.persistence.stores.orderings.TaskOrdering
import io.cumulus.persistence.stores.orderings.TaskOrderingType.OrderByCreationDesc

import scala.concurrent.{ExecutionContext, Future}


class TaskService(
  userService: UserService,
  storageService: StorageService,
  sharingService: SharingService,
  sessionService: SessionService,
  mailService: MailService,
  taskStore: TaskStore
)(
  implicit ec: ExecutionContext
) extends Logging {

  // TODO tests
  def getTasksToExecute: Future[Either[AppError, Seq[Task]]] = {
    QueryE
      .lift(
        taskStore
          .findAll(
            TaskFilter(TaskStatus.WAITING, Some(LocalDateTime.now)),
            TaskOrdering.of(OrderByCreationDesc)
          )
      ).run()
  }

  def upsertTask(task: Task): Future[Either[AppError, Int]] = {
    QueryE.lift(taskStore.upsert(task)).run()
  }

  // TODO doc
  def executeOnceTask(task: OnceTask): Future[Either[AppError, Unit]] = {
    task
      .execute(userService, storageService, sharingService, sessionService, mailService)
      .recover {
        // Also handle unhandled failure
        case e =>
          logger.warn("Unhandled exception during the task execution", e)
          Left(AppError.technical("TODO unhandled error")) // TODO error message
      }
  }

  // TODO
  def executeRecurrentTask(task: RecurrentTask): Future[Either[AppError, RecurrentTask]] = ???


}

