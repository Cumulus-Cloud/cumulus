package io.cumulus.models.task

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.File
import io.cumulus.models.user.session.UserSession
import io.cumulus.services._
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.Future

/**
  * Task to delete a storage reference.
  */
case class MetadataExtractionTask(
  id: UUID,
  status: TaskStatus,
  creation: LocalDateTime,
  file: File,
  session: UserSession,
  scheduledExecution: Option[LocalDateTime] = None,
  retried: Int = 0,
  // lastError: Option[AppError] = None
) extends OnceTask {

  override def name: String = "MetadataExtractionTask"

  def execute(
    userService: UserService,
    storageService: StorageService,
    sharingService: SharingService,
    sessionService: SessionService,
    mailService: MailService
  ): Future[Either[AppError, Unit]] = {
    import scala.concurrent.ExecutionContext.Implicits.global

    storageService
      .extractMetadata(file)(session)
      .map(_.map(_ => ()))
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

object MetadataExtractionTask {

  def create(file: File)(implicit session: UserSession): MetadataExtractionTask =
    MetadataExtractionTask(
      UUID.randomUUID,
      TaskStatus.WAITING,
      LocalDateTime.now,
      file,
      session
    )

  implicit val format: OFormat[MetadataExtractionTask] =
    Json.format[MetadataExtractionTask]

}
