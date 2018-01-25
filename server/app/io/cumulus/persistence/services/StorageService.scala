package io.cumulus.persistence.services

import scala.concurrent.{ExecutionContext, Future}

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
import io.cumulus.models.{Path, UserSession}
import io.cumulus.persistence.storage.StorageEngine
import io.cumulus.stages._

class StorageService(
  fsNodeService: FsNodeService,
  storageEngine: StorageEngine
)(
  implicit
  ciphers: Ciphers,
  compressions: Compressions,
  materializer: Materializer,
  settings: Settings,
  metadataExtractors: MetadataExtractors,
  thumbnailGenerators: ThumbnailGenerators,
  ec: ExecutionContext
) extends Logging {


  /**
    * Upload the provided file (with its content), uploading the data using the implicit storage engine and creating
    * the metadata related object in the database.<br/>
    *
    * This method will also try to extract metadata from the file (if available) and to generate a thumbnail (if
    * available).
    *
    * @param path The path of the file to upload to
    * @param cipher The cipher to use on the file
    * @param compression The compression to use on the file
    * @param content The stream of the content of the file
    * @param session The user performing the operation
    */
  def uploadFile(
    path: Path,
    cipher: Option[CipherStage],
    compression: Option[CompressionStage],
    content: Source[ByteString, _]
  )(implicit session: UserSession) = {
    implicit val user = session.user

    for {
      // Check that the file can be uploaded
      _ <- EitherT(fsNodeService.checkForNewNode(path))

      // Define the file writer from this information
      fileWriter = {
        StorageReferenceWriter(
          storageEngine,
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

      // Create an entry in the database for the file
      file <- EitherT(fsNodeService.createFile(fileWithMetadata))

      // Create a thumbnail (if possible) for the file
      _    <- EitherT(generateThumbnail(file))

    } yield file
  }.value


  /**
    * Finds a file content by its path and owner. Will fail if the element does not exist or is not a file.
    * @param path The path of the file
    * @param session The session performing the operation
    */
  def downloadFile(path: Path, maybeRange: Option[Range])(implicit session: UserSession): Future[Either[AppError, Source[ByteString, _]]] = {
    implicit val user = session.user

    for {
      file    <- EitherT(fsNodeService.findFile(path))
      content <- EitherT.fromEither[Future]{
        maybeRange match {
          // Range provided, only return a chunk of the file
          case Some(range) =>
            StorageReferenceReader(
              storageEngine,
              file,
              range
            )
          // No range provided, return the content from the start
          case _ =>
            StorageReferenceReader(
              storageEngine,
              file
            )
        }
      }
    } yield content
  }.value

  /** Extract the metadata of the provided file */
  private def extractMetadata(file: File)(implicit session: UserSession): Either[AppError, FileMetadata] = {
    val metadataExtractor =  metadataExtractors.get(file.mimeType)

    metadataExtractor.extract(file, storageEngine)
  }

  /** Generate a thumbnail of the provided file */
  private def generateThumbnail(file: File)(implicit session: UserSession): Future[Either[AppError, Option[File]]] = {
    val thumbnailGenerator = thumbnailGenerators.get(file.mimeType)
    implicit val user = session.user

    thumbnailGenerator.map { generator =>
      EitherT(generator.generate(file, storageEngine)).flatMap { thumbnail =>
        EitherT(fsNodeService.createFile(thumbnail)).map(Some(_))
      }
    }.getOrElse(EitherT.fromEither[Future](Right(None))).value
  }


}