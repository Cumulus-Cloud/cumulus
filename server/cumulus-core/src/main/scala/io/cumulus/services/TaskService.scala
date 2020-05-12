package io.cumulus.services

import io.cumulus.validation.AppError
import io.cumulus.task.{OnceTask, RecurrentTask, TaskExecutionContext}
import io.cumulus.utils.Logging

import scala.concurrent.{ExecutionContext, Future}


/** Service handling the execution of tasks. */
class TaskService(
  userService: UserService,
  fsNodeService: FsNodeService,
  storageService: StorageService,
  sharingService: SharingService,
  sessionService: SessionService,
  mailService: MailService
)(
  implicit ec: ExecutionContext
) extends Logging {

  // TODO doc
  def executeOnceTask(task: OnceTask): Future[Either[AppError, Unit]] = {
    task
      .execute(
        TaskExecutionContext(
          userService,
          fsNodeService,
          storageService,
          sharingService,
          sessionService,
          mailService,
          ec
        )
      )
      .recover {
        // Also handle unhandled failure
        case e =>
          logger.warn("Unhandled exception during the task execution", e)
          Left(AppError.technical("TODO unhandled error")) // TODO error message
      }
  }

  // TODO
  def executeRecurrentTask(task: RecurrentTask): Future[Either[AppError, Unit]] =
    ???

}

