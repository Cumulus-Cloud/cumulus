package io.cumulus.models.task

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.validation.AppError
import io.cumulus.models.task.TaskStatus._
import io.cumulus.services._
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.Future

sealed trait Task {

  /** Unique ID of the task. */
  def id: UUID

  /** Human readable task name. */
  def name: String

  /** Status of the task. */
  def status: TaskStatus

  /** If the task is recurrent. */
  def recurrent: Boolean

  /** Creation date of the task. */
  def creation: LocalDateTime

  /** Next scheduled execution. Empty for as soon as possible. */
  def scheduledExecution: Option[LocalDateTime]

  /** Maximum number of retry for the task, defaulted to 0 (failed after the first error). */
  val maxRetry: Int = 0

  //def lastError: Option[AppError]

  /** Number of times the task have been retried. */
  def retried: Int


  // ==== TESTS ====

  def successful: Task = {
    copyTask(
      status = DONE
    )
  }
  
  def failed(error: AppError): Task = {
    if(retried >= maxRetry)
      copyTask(
        status = FAILED,
        scheduledExecution = scheduledExecution.map(_.plusMinutes(10)), // TODO get from settings
       // lastError = Some(error)
      )
    else
      copyTask(
        status = WAITING,
        scheduledExecution = scheduledExecution.map(_.plusMinutes(10)), // TODO get from settings
        retried = retried + 1,
       // lastError = Some(error)
      )
  }

  def execute(
    userService: UserService,
    storageService: StorageService,
    sharingService: SharingService,
    sessionService: SessionService,
    mailService: MailService
  ): Future[Either[AppError, Unit]]

  def copyTask(
    status: TaskStatus,
    scheduledExecution: Option[LocalDateTime] = scheduledExecution,
    retried: Int = retried,
    lastError: Option[AppError] = None
  ): Task

  // ==== TESTS ====


}

object Task {

  implicit val format: OFormat[Task] =
    Json.format[Task]

}

trait OnceTask extends Task {

  /** Once task are never recurrent. */
  val recurrent: Boolean = false

}

trait RecurrentTask extends Task {

  /** Recurrent tasks are always recurrent. */
  val recurrent: Boolean = true

  /**
    * Reschedule the task to a later provided date.
    * @param to The date after which the task will be performed.
    */
  def reschedule(to: LocalDateTime): Task =
    copyTask(
      status = WAITING,
      scheduledExecution = Some(to)
    )

}
