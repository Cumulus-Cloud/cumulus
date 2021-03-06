package io.cumulus.stream.storage

import scala.concurrent.ExecutionContext
import akka.NotUsed
import akka.stream.scaladsl.{Flow, Source}
import akka.util.ByteString
import io.cumulus.Logging
import io.cumulus.stream.utils.ByteRange
import io.cumulus.utils.Range
import io.cumulus.validation.AppError
import io.cumulus.models.fs.File
import io.cumulus.models.user.session.Session
import io.cumulus.persistence.storage.{StorageEngines, StorageObject, StorageReference}
import io.cumulus.stages.{Ciphers, Compressions}


object StorageReferenceReader extends Logging {

  /**
    * Reads the thumbnail of a file. If the thumbnail does not exists, an error will be returned.
    *
    * @param file The file containing the thumbnail to stream.
    */
  def thumbnailReader(
    file: File
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    ec: ExecutionContext
  ): Either[AppError, Source[ByteString, NotUsed]] =
    for {
      transformation   <- transformationForThumbnail(file)
      storageReference <- file.thumbnailStorageReference.toRight(AppError.notFound("validation.fs-node.no-thumbnail", file.name))
      storageEngine    <- storageEngines.get(storageReference)
      source = {
        Source(storageReference.storage.toList)
          .splitWhen(_ => true)
          .via(StorageObjectReader.reader(storageEngine, transformation))
          .mergeSubstreams
      }
    } yield source

  /**
    * Reads a file in its wholeness, and output a stream of its byte after applying the provided transformation
    * to each storage object.
    *
    * @param file The file to stream.
    */
  def reader(
    file: File
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    ec: ExecutionContext
  ): Either[AppError, Source[ByteString, NotUsed]] =
    if (file.size <= 0) // Special case for empty files, which require neither any transformation nor any actual download
      Right(Source(List.empty))
    else
      for {
        transformation <- transformationForFile(file)
        storageEngine  <- storageEngines.get(file.storageReference)
        source = {
          Source(file.storageReference.storage.toList)
            .splitWhen(_ => true)
            .via(StorageObjectReader.reader(storageEngine, transformation))
            .mergeSubstreams
            .recover(errorHandler(file))
        }
      } yield source

  /**
    * Reads partially a file, from the starts of the range to end of the range. The reader will drop and ignore every
    * storage object outside of the range, and trim bytes still outside of the requested range.
    *
    * @param file The file to stream.
    * @param range The range of byte to output.
    */
  def reader(
    file: File,
    range: Range
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    ec: ExecutionContext
  ): Either[AppError, Source[ByteString, NotUsed]] =
    if (file.size <= 0) // Special case for empty files, which require neither any transformation nor any actual download
      Right(Source(List.empty))
    else
      for {
        transformation <- transformationForFile(file)
        storageEngine  <- storageEngines.get(file.storageReference)
        source         =  {
          // Compute the objects within the range and the real byte range to read
          val (from, to, storageObjectsInRange) = computeDroppedObjects(range, file)

          Source(storageObjectsInRange.toList) // Only use objects in range
            .splitWhen(_ => true)
            .via(StorageObjectReader.reader(storageEngine, transformation))
            .mergeSubstreams
            .via(ByteRange(from, to)) // Don't forget to 'trim' the stream of bytes outside the offsets
            .recover(errorHandler(file))
        }
      } yield source

  /**
    * Compute the dropped storage objects outside of the requested range, and returns the real range and the list of
    * the objects within the interval provided by the range. The real range is where the read cursor should be
    * positioned within the returned storage objects.
    */
  private def computeDroppedObjects(range: Range, file: File): (Long, Long, Seq[StorageObject]) = {

    // We need to compute the storage object that are within the range and that we need to read. We also need the
    // real range of byte taking into account the dropped storage objects. In order to achieve this we fold keeping
    // 4 information: the number of bytes read, the start of the range, the end of the range and the list of storage
    // objects to read
    val (_, realFrom, realTo, storageObjectsInRange) =
      file
        .storageReference
        .storage
        .foldLeft((0l, 0l, 0l, Seq.empty[StorageObject])) {
          case ((cursor, from, to, storageObjects), storageObject) =>
            if (range.start > cursor + storageObject.size) {
              // Skip the object (before range start)
              (cursor + storageObject.size, from, to, storageObjects)
            } else if (range.end < cursor) {
              // Skip the object (after range end)
              (cursor + storageObject.size, from, to, storageObjects)
            } else {
              // Object within the start and the end of the range

              val objectFrom = if (range.start > cursor)
                range.start - cursor
              else
                0

              val objectTo = if (range.end < (cursor + storageObject.size))
                range.end - cursor
              else
                storageObject.size

              (
                cursor + storageObject.size,
                if (objectFrom != 0) objectFrom else from,
                to + objectTo,
                storageObjects :+ storageObject
              )
            }
        }
    (realFrom, realTo, storageObjectsInRange)
  }

  /** Generate the transformations for a given file. */
  private def transformationForThumbnail(file: File)(implicit session: Session, ciphers: Ciphers, compressions: Compressions) = {
    file.thumbnailStorageReference.map { storageReference =>
      for {
        cipher      <- cipherStageForStorageReference(storageReference)
        compression <- compressionStageForStorageReference(storageReference)
      } yield {
        Flow[ByteString]
          .via(cipher.getOrElse(Flow[ByteString]))
          .via(compression.getOrElse(Flow[ByteString]))
      }
    }.getOrElse(Right(Flow[ByteString]))
  }

  /** Generate the transformations for a given file. */
  private def transformationForFile(file: File)(implicit session: Session, ciphers: Ciphers, compressions: Compressions) = {
    for {
      cipher      <- cipherStageForStorageReference(file.storageReference)
      compression <- compressionStageForStorageReference(file.storageReference)
    } yield {
      Flow[ByteString]
        .via(cipher.getOrElse(Flow[ByteString]))
        .via(compression.getOrElse(Flow[ByteString]))
    }
  }

  /** Generate the decryption stage for a given file. */
  private def cipherStageForStorageReference(storageReference: StorageReference)(implicit session: Session, ciphers: Ciphers) =
    storageReference.cipher match {
      case None =>
        Right(None)
      case Some(cipher) =>
        for {
          cipherStage      <- ciphers.get(cipher.name)
          filePrivateKey   <- session.privateKeyOfFile(storageReference).toRight(AppError.validation("validation.fs-node.unknown-key", storageReference.id.toString))
          cipherFlow       =  cipherStage.decrypt(filePrivateKey, cipher.salt)
        } yield Some(cipherFlow)
    }

  /** Generate the decompression stage for a given file. */
  private def compressionStageForStorageReference(storageReference: StorageReference)(implicit compressions: Compressions) =
    compressions
      .get(storageReference.compression)
      .map(_.map(_.uncompress))

  /** Custom error handler to log errors */
  private def errorHandler(file: File): PartialFunction[Throwable, ByteString] = {
    case e: Exception =>
      val engineUsed =
        file
          .storageReference
          .storage
          .headOption
          .map(s => s.storageEngine + " version " + s.storageEngineVersion)
          .getOrElse("Nothing")

      logger.error(s"Error while reading file ${file.id} using $engineUsed", e)
      ByteString.empty
  }

}
