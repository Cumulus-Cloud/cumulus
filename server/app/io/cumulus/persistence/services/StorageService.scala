package io.cumulus.persistence.services

import scala.concurrent.{ExecutionContext, Future}

import akka.actor.ActorRef
import akka.stream.Materializer
import akka.stream.scaladsl.Source
import akka.util.ByteString
import cats.data.EitherT
import cats.implicits._
import io.cumulus.core.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.core.utils.Range
import io.cumulus.core.validation.AppError
import io.cumulus.core.{Logging, Settings}
import io.cumulus.models.fs.{File, FileMetadata}
import io.cumulus.models.{Path, Session, UserSession}
import io.cumulus.persistence.storage.{StorageEngines, StorageReference}
import io.cumulus.stages._

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
    * Upload the provided file (with its content), uploading the data using the implicit storage engine and creating
    * the metadata related object in the database.
    * <br/><br/>
    * This method will also try to extract metadata from the file (if available) and to generate a thumbnail (if
    * available).
    *
    * @param path The path of the file to upload to.
    * @param cipher The cipher to use on the file.
    * @param compression The compression to use on the file.
    * @param content The stream of the content of the file.
    * @param session The user performing the operation.
    */
  def uploadFile(
    path: Path,
    cipher: Option[CipherStage],
    compression: Option[CompressionStage],
    content: Source[ByteString, _]
  )(implicit session: UserSession): Future[Either[AppError, File]] = {
    implicit val user = session.user

    for {
      // Check that the file can be uploaded
      _ <- EitherT(fsNodeService.checkForNewNode(path))

      // Define the file writer from this information
      fileWriter = {
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
      metadata          <- EitherT.fromEither[Future](extractMetadata(uploadedFile))
      fileWithMetadata  =  uploadedFile.copy(metadata = metadata)

      // Generate a thumbnail (if possible)
      maybeThumbnail    <- EitherT(generateThumbnail(fileWithMetadata))
      fileWithThumbnail =  fileWithMetadata.copy(thumbnailStorageReference = maybeThumbnail)

      // Create an entry in the database for the file
      file <- EitherT(fsNodeService.createFile(fileWithThumbnail))

    } yield file

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
    * Delete a file's reference and content by its reference. Safe to use on both directory and file. In case of a
    * file, the file's content will also be deleted.
    *
    * @see [[io.cumulus.persistence.services.FsNodeService#deleteNode FsNodeService.deleteNode]]
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

  /** Extract the metadata of the provided file. */
  private def extractMetadata(file: File)(implicit session: UserSession): Either[AppError, FileMetadata] = {
    val metadataExtractor = metadataExtractors.get(file.mimeType)

    metadataExtractor.extract(file)
  }

  /** Generate a thumbnail of the provided file. */
  private def generateThumbnail(file: File)(implicit session: UserSession): Future[Either[AppError, Option[StorageReference]]] = {
    val thumbnailGenerator = thumbnailGenerators.get(file.mimeType)

    thumbnailGenerator match {
      case Some(generator) =>
        generator.generate(file).map(_.map(Some(_)))
      case None =>
        Future.successful(Right(None))
    }
  }

}