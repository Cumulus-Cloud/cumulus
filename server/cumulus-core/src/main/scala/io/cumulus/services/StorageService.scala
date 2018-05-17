package io.cumulus.services

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
import io.cumulus.models.Path
import io.cumulus.models.fs.{DefaultMetadata, File, FileMetadata}
import io.cumulus.models.user.{Session, UserSession}
import io.cumulus.persistence.storage.{StorageEngines, StorageReference}
import io.cumulus.stages._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

class StorageService(
  fsNodeService: FsNodeService,
  chunkRemover: ActorRef
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
    * @param path The path of the file to upload to.
    * @param cipherName The name of the cipher to use on the file.
    * @param compressionName The name of the compression to use on the file.
    * @param content The stream of the content of the file.
    * @param session The user performing the operation.
    */
  def uploadFile(
    path: Path,
    cipherName: Option[String],
    compressionName: Option[String],
    content: Source[ByteString, _]
  )(implicit session: UserSession): Future[Either[AppError, File]] = {
    implicit val user = session.user

    // Operations to perform before the upload process starts
    val preUpload = for {
      // Get the cipher and compression from the request
      cipher      <- EitherT.fromEither[Future](ciphers.get(cipherName))
      compression <- EitherT.fromEither[Future](compressions.get(compressionName))

      // Check that no other file already exists at the same path
      _ <- EitherT(fsNodeService.checkForNewNode(path))
    } yield cipher -> compression


    preUpload
      .leftSemiflatMap { error =>
        // In case we get any error here, we still need to empty the body otherwise chrome or firefox
        // will think that a network error has occurred
        content.runWith(Sink.ignore).map(_ => error)
      }
      .flatMap { case (cipher, compression) =>
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

          // Extract metadata
          metadata         = extractMetadata(uploadedFile)
          fileWithMetadata = uploadedFile.copy(metadata = metadata)

          // Generate a thumbnail (if possible)
          maybeThumbnail    <- EitherT.right(generateThumbnail(fileWithMetadata))
          fileWithThumbnail =  fileWithMetadata.copy(thumbnailStorageReference = maybeThumbnail)

          // Create an entry in the database for the file
          file <- EitherT(fsNodeService.createFile(fileWithThumbnail))

        } yield file
      }

  }.value

  /**
    * Finds a file's content by its path and owner. Will fail if the element does not exist or is not a file.
    * @param path The path of the file to read.
    * @param session The session performing the operation.
    */
  def downloadFile(path: Path, maybeRange: Option[Range])(implicit session: Session): Future[Either[AppError, Source[ByteString, _]]] = {
    fsNodeService.findFile(path)(session.user).map(_.flatMap(file => downloadFile(file, maybeRange)))
  }

  /**
    * Finds a file's content by its reference. Will fail if the element does not exist or is not a file.
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
    * Finds a file content by its path and owner. Will fail if the element does not exist or is not a file.
    * @param path The path of the file.
    * @param session The session performing the operation.
    */
  def downloadThumbnail(path: Path)(implicit session: Session): Future[Either[AppError, Source[ByteString, _]]] = {
    implicit val user = session.user

    for {
      file    <- EitherT(fsNodeService.findFile(path))
      content <- EitherT.fromEither[Future](StorageReferenceReader.thumbnailReader(file))
    } yield content

  }.value

  /**
    * Deletes a file's reference and content by its reference. Safe to use on both directory and file. In case of a
    * file, the file's content will also be deleted.
    *
    * @see [[io.cumulus.services.FsNodeService#deleteNode FsNodeService.deleteNode]]
    * @param path The file's path.
    */
  def deleteNode(path: Path)(implicit session: UserSession): Future[Either[AppError, Unit]] = {
    fsNodeService.deleteNode(path)(session.user).map(_.map {
      case file: File =>
        // Delete the file and its thumbnail
        file.thumbnailStorageReference.foreach(chunkRemover ! _)
        chunkRemover ! file
      case _ =>
        // Nothing to delete
    })
  }

  /** Extracts the metadata of the provided file. Will suppress and log any error. */
  private def extractMetadata(file: File)(implicit session: UserSession): FileMetadata = {
    val metadataExtractor = metadataExtractors.get(file.mimeType)

    Try {
      metadataExtractor.extract(file)
    } match {
      case Success(metadata) =>
        metadata.left.map { appError =>
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
  }

  /** Generates a thumbnail of the provided file. */
  private def generateThumbnail(file: File)(implicit session: UserSession): Future[Option[StorageReference]] = {
    val thumbnailGenerator = thumbnailGenerators.get(file.mimeType)

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

  }

}