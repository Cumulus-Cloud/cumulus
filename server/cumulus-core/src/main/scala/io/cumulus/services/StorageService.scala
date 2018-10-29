package io.cumulus.services

import java.util.UUID

import akka.actor.ActorRef
import akka.stream.Materializer
import akka.stream.scaladsl.{Sink, Source}
import akka.util.ByteString
import cats.data.EitherT
import cats.implicits._
import io.cumulus.core.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.core.utils.Range
import io.cumulus.core.validation.AppError
import io.cumulus.core.{Logging, Settings}
import io.cumulus.models.fs.{DefaultMetadata, File}
import io.cumulus.services.tasks.{MetadataExtractionTask, StorageReferenceDeletionTask, ThumbnailCreationTask}
import io.cumulus.models.user.User
import io.cumulus.models.user.session.{Session, UserSession}
import io.cumulus.persistence.storage.{StorageEngines, StorageObject, StorageReference}
import io.cumulus.stages._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

class StorageService(
  fsNodeService: FsNodeService,
  taskExecutor: => ActorRef
)(
  implicit
  ciphers: Ciphers,
  compressions: Compressions,
  storageEngines: StorageEngines,
  materializer: Materializer,
  settings: Settings,
  metadataExtractors: MetadataExtractors,
  thumbnailGenerators: ThumbnailGenerators,
  ec: ExecutionContext
) extends Logging {

  /**
    * Uploads the provided file (with its content), uploading the data using the implicit storage engine and creating
    * the metadata related object in the database.
    * <br/><br/>
    * This method will also try to extract metadata from the file (if available) and to generate a thumbnail (if
    * available).
    *
    * @param id The unique ID of the parent directory.
    * @param filename The name of thew new file.
    * @param cipherName The name of the cipher to use on the file.
    * @param compressionName The name of the compression to use on the file.
    * @param content The stream of the content of the file.
    * @param session The user performing the operation.
    */
  def uploadFile(
    id: UUID,
    filename: String,
    cipherName: Option[String],
    compressionName: Option[String],
    content: Source[ByteString, _]
  )(implicit session: UserSession): Future[Either[AppError, File]] = {
    implicit val user: User = session.user

    // Operations to perform before the upload process starts
    val preUpload = for {
      // Get the cipher and compression from the request
      cipher      <- EitherT.fromEither[Future](ciphers.get(cipherName))
      compression <- EitherT.fromEither[Future](compressions.get(compressionName))

      // Check that no other file already exists at the same path
      path <- EitherT(fsNodeService.checkForNewNode(id, filename))
    } yield (path, cipher, compression)


    preUpload
      .leftSemiflatMap { error =>
        // In case we get any error here, we still need to empty the body otherwise chrome or firefox
        // will think that a network error has occurred
        content.runWith(Sink.ignore).map(_ => error)
      }
      .flatMap { case (path, cipher, compression) =>
        for {
          // Define the file writer from this information
          fileWriter <- EitherT.fromEither[Future] {
            StorageReferenceWriter.writer(
              storageEngines.default, // Always use the default storage engine during upload
              cipher,
              compression,
              path
            )
          }

          // Store the file's content
          uploadedFile <- EitherT.liftF(content.runWith(fileWriter))

          // Create an entry in the database for the file
          file <- EitherT(fsNodeService.createFile(uploadedFile))

          // Extract metadata & generate a thumbnail (if possible)
          _ = taskExecutor ! MetadataExtractionTask.create(uploadedFile)
          _ = taskExecutor ! ThumbnailCreationTask.create(uploadedFile)

        } yield file
      }

  }.value

  /**
    * Downloads a file's content by its unique ID and owner. Will fail if the element does not exist or is not a file.
    *
    * @param id The ID of the file to read.
    * @param session The session performing the operation.
    */
  def downloadFile(id: UUID, maybeRange: Option[Range])(implicit session: Session): Future[Either[AppError, Source[ByteString, _]]] = {
    fsNodeService.findFile(id)(session.user)
      .map(_.flatMap(file => downloadFile(file, maybeRange)))
  }

  /**
    * Finds a file's content by its reference. Will fail if the element does not exist or is not a file.
    *
    * @param file The file to read.
    * @param session The session performing the operation.
    */
  def downloadFile(file: File, maybeRange: Option[Range])(implicit session: Session): Either[AppError, Source[ByteString, _]] = {
    maybeRange match {
      // Range provided, only return a chunk of the file
      case Some(range) =>
        StorageReferenceReader.reader(file, range)
      // No range provided, return the content from the start
      case _ =>
        StorageReferenceReader.reader(file)
    }
  }

  /**
    * Finds a file content by its unique ID and owner. Will fail if the element does not exist or is not a file.
    *
    * @param id The ID of the file.
    * @param session The session performing the operation.
    */
  def downloadThumbnail(id: UUID)(implicit session: Session): Future[Either[AppError, Source[ByteString, _]]] = {
    implicit val user: User = session.user

    for {
      file    <- EitherT(fsNodeService.findFile(id))
      content <- EitherT.fromEither[Future](StorageReferenceReader.thumbnailReader(file))
    } yield content

  }.value

  /**
    * Deletes a file's reference and content by its reference. Safe to use on both directory and file. In case of a
    * file, the file's content will also be deleted.
    *
    * @see [[io.cumulus.services.FsNodeService#deleteNode FsNodeService.deleteNode]]
    * @param id The file's unique ID.
    */
  def deleteNode(id: UUID)(implicit session: UserSession): Future[Either[AppError, Unit]] = {
    fsNodeService.deleteNode(id, deleteContent = false)(session.user).map(_.map {
      case file: File =>
        // Create a task to delete the file and its thumbnail
        file.thumbnailStorageReference.foreach(taskExecutor ! StorageReferenceDeletionTask.create(_))
        taskExecutor ! StorageReferenceDeletionTask.create(file.storageReference)
      case _ =>
        // Nothing to delete
    })
  }

  /**
    * Delete a storage reference. Unsafe method, be sure that the storage reference is not used before deleting it.
    * @param storageReference The storage reference to delete.
    */
  def deleteStorageReference(storageReference: StorageReference): Future[Either[AppError, Unit]] = {

    for {
      storageEngine <- EitherT.fromEither[Future](storageEngines.get(storageReference))
      result        <- EitherT[Future, AppError, Unit] {
        Future.sequence(
          storageReference
            .storage
            .map { storageObject =>
              storageEngine.deleteObject(storageObject.id).map { r =>
                r.left.map { error =>
                  // Log errors
                  logger.warn(s"Error occurred during deletion of ${storageObject.id}: $error")
                  error
                }
              }
            }
        ).map(_ => Right({})) // Ignore results
      }
    } yield result

  }.value

  /**
    * Delete a storage object. Unsafe method, be sure that the storage object is not used before deleting it.
    * @param storageObject The storage object to delete.
    */
  def deleteStorageObject(storageObject: StorageObject): Future[Either[AppError, Unit]] = {

    for {
      storageEngine <- EitherT.fromEither[Future](storageEngines.get(storageObject))
      result        <- EitherT(storageEngine.deleteObject(storageObject.id)).leftMap {
        error =>
          // Log errors
          logger.warn(s"Error occurred during deletion of ${storageObject.id}: $error")
          error
      }
    } yield result

  }.value

  /** Extracts the metadata of the provided file. Will suppress and log any error. */
  def extractMetadata(file: File)(implicit session: UserSession): Future[Either[AppError, File]] = {
    val metadataExtractor = metadataExtractors.get(file.mimeType)

    val metadata =
      Try {
        metadataExtractor.extract(file)
      } match {
        case Success(result) =>
          result.left.map { appError =>
            // Do not fail the upload if the metadata extraction failed
            logger.info(s"Failed to extract metadata of file ${file.path}: $appError")
            DefaultMetadata.empty
          }
          .merge
        case Failure(error) =>
          // Handle unexpected error if the metadata generation failed
          logger.warn(s"Failed to extract metadata of file ${file.path} with an unexpected error", error)
          DefaultMetadata.empty
      }

    // And save the file
    fsNodeService.setMetadata(file, metadata)(session.user)

  }

  /** Generates a thumbnail of the provided file. */
  def generateThumbnail(file: File)(implicit session: UserSession): Future[Either[AppError, File]] = {
    val thumbnailGenerator = thumbnailGenerators.get(file.mimeType)

    // Generate the thumbnail
    val maybeThumbnail =
      Try {
        thumbnailGenerator match {
          case Some(generator) =>
            generator.generate(file).map(_.map(Some(_)))
          case None =>
            Future.successful(Right(None))
        }
      } match {
        case Success(thumbnail) =>
          thumbnail.map { result =>
            result
              .left.map { appError =>
                // Do not fail the upload if the metadata extraction failed
                logger.info(s"Failed to generate thumbnail of file ${file.path}: $appError")
                None
              }
              .merge
          }
        case Failure(error) =>
          // Handle unexpected error if the metadata generation failed
          logger.warn(s"Failed to create a thumbnail of the file ${file.path} with an unexpected error", error)
          Future.successful(None)
      }

    // And save the thumbnail
    maybeThumbnail.flatMap(thumbnail => fsNodeService.setThumbnail(file, thumbnail)(session.user))

  }

}