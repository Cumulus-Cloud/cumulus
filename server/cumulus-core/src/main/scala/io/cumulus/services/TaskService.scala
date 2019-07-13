package io.cumulus.services

import io.cumulus.Logging
import io.cumulus.validation.AppError
import io.cumulus.task.{OnceTask, RecurrentTask}

import scala.concurrent.{ExecutionContext, Future}


class TaskService(
  userService: UserService,
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
      .execute(userService, storageService, sharingService, sessionService, mailService)
      .recover {
        // Also handle unhandled failure
        case e =>
          logger.warn("Unhandled exception during the task execution", e)
          Left(AppError.technical("TODO unhandled error")) // TODO error message
      }
  }

  // TODO
  def executeRecurrentTask(task: RecurrentTask): Future[Either[AppError, Unit]] = ???

}

