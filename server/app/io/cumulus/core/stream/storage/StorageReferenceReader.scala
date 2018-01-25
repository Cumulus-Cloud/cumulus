package io.cumulus.core.stream.storage

import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream.scaladsl.{Flow, Source}
import akka.util.ByteString
import io.cumulus.core.stream.utils.ByteRange
import io.cumulus.core.utils.Range
import io.cumulus.core.validation.AppError
import io.cumulus.models.Session
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}
import io.cumulus.stages.{Ciphers, Compressions}

object StorageReferenceReader {

  /**
    * Reads a file in its wholeness, and output a stream of its byte after applying the provided transformation
    * to each storage object.
    *
    * @param storageEngine The storage engine to use.
    * @param file The file to stream
    */
  def apply(
    storageEngine: StorageEngine,
    file: File
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    ec: ExecutionContext
  ): Either[AppError, Source[ByteString, NotUsed]] =
    for {
      transformation <- transformationForFile(file)
      source         =  {
        Source(file.storageReference.storage.toList)
          .splitWhen(_ => true)
          .via(StorageObjectReader(storageEngine, transformation))
          .mergeSubstreams
      }
    } yield source

  /**
    * Reads partially a file, from the starts of the range to end of the range. The reader will drop and ignore every
    * storage object outside of the range, and trim bytes still outside of the wanted range.
    *
    * @param storageEngine The storage engine to use.
    * @param file The file to stream
    * @param range The range of byte to output
    */
  def apply(
    storageEngine: StorageEngine,
    file: File,
    range: Range
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    ec: ExecutionContext
  ): Either[AppError, Source[ByteString, NotUsed]] =
    for {
      transformation <- transformationForFile(file)
      source         =  {

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

        Source(storageObjectsInRange.toList) // Only use objects in range
          .splitWhen(_ => true)
          .via(StorageObjectReader(storageEngine, transformation))
          .mergeSubstreams
          .via(ByteRange(realFrom, realTo)) // Don't forget to 'trim' the stream of bytes outside the offsets
      }
    } yield source

  /** Generate the transformations for a given file */
  private def transformationForFile(file: File)(implicit session: Session, ciphers: Ciphers, compressions: Compressions) =
    for {
      cipher      <- ciphers.get(file.storageReference.cipher)
      compression <- compressions.get(file.storageReference.compression)
    } yield {
      val (privateKey, salt) = session.privateKeyAndSalt

      Flow[ByteString]
        .via(cipher.map(_.decrypt(privateKey, salt)).getOrElse(Flow[ByteString]))
        .via(compression.map(_.uncompress).getOrElse(Flow[ByteString]))
    }

}
