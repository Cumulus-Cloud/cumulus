package io.cumulus.models.task

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.validation.AppError
import io.cumulus.persistence.storage.StorageReference
import io.cumulus.services._
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.Future

/**
  * Task to delete a storage reference.
  */
case class DeleteStorageReferenceTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  storageReference: StorageReference,
  scheduledExecution: Option[LocalDateTime] = None,
  retried: Int = 0,
  // lastError: Option[AppError] = None
) extends OnceTask {

  override def name: String = "DeleteChunkTask"

  def execute(
    userService: UserService,
    storageService: StorageService,
    sharingService: SharingService,
    sessionService: SessionService,
    mailService: MailService
  ): Future[Either[AppError, Unit]] = {
    storageService.deleteStorageReference(storageReference)
  }

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

object DeleteStorageReferenceTask {

  def create(storageReference: StorageReference): DeleteStorageReferenceTask =
    DeleteStorageReferenceTask(
      UUID.randomUUID,
      TaskStatus.WAITING,
      LocalDateTime.now,
      storageReference
    )

  implicit val format: OFormat[DeleteStorageReferenceTask] =
    Json.format[DeleteStorageReferenceTask]

}
