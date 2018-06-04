package io.cumulus.services

import java.time.LocalDateTime

import cats.data.EitherT
import io.cumulus.core.Logging
import io.cumulus.core.persistence.query.{QueryE, QueryPagination}
import io.cumulus.core.validation.AppError
import io.cumulus.models.task.{OnceTask, RecurrentTask, Task, TaskStatus}
import io.cumulus.persistence.stores.TaskStore
import cats.implicits._
import io.cumulus.persistence.stores.filters.TaskFilter
import io.cumulus.persistence.stores.orderings.TaskOrderingType.OrderByCreationDesc
import io.cumulus.persistence.stores.orderings.{TaskOrdering, TaskOrderingType}

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

  // TODO doc
  def executeOnceTask(task: OnceTask): Future[Either[AppError, Task]] = {
    (for {
      // Check task coherence
      _ <- EitherT.fromEither[Future] {
        if (task.recurrent || task.status != TaskStatus.WAITING)
          Left(AppError.technical("TODO invalid task status and/or type")) // TODO error message
        else
          Right(())
      }

      // Upsert the task
      _ <- EitherT(QueryE.lift(taskStore.upsert(task)).run())

      // Run the task
      result <- EitherT[Future, AppError, Task](
        task
          .execute(userService, storageService, sharingService, sessionService, mailService)
          .map { result =>
            Right[AppError, Task](
              result
                .map(_ => task.successful)
                .left.map { appError =>
                  // If the task failed, update the task with the last failure
                  logger.warn(s"Task execution failed with $appError") // TODO better error log
                  task.failed(appError)
                }.merge
            )
          }
          .recover {
            // Also handle unhandled failure
            case e =>
              logger.warn("Unhandled exception during the task execution", e)
              val appError = AppError.technical("TODO unhandled error") // TODO error message
              Right(task.failed(appError))
          }
      )

      // Save the updated task
      _ <- EitherT(QueryE.lift(taskStore.update(result)).run())

    } yield result).value

  }

  // TODO
  def executeRecurrentTask(task: RecurrentTask): Future[Either[AppError, RecurrentTask]] = ???


}

