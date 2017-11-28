package io.cumulus.core.stream.storage

import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream.scaladsl.{Flow, Source}
import akka.util.ByteString
import io.cumulus.core.stream.utils.ByteRange
import io.cumulus.core.utils.Range
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}

object StorageReferenceReader {

  /**
    * Reads a file in its wholeness, and output a stream of its byte after applying the provided transformation
    * to each storage object.
    *
    * @param storageEngine The storage engine to use.
    * @param transformation The transformation to apply (decompression, etc..)
    * @param file The file to stream
    */
  def apply(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed],
    file: File
  )(implicit ec: ExecutionContext): Source[ByteString, NotUsed] = {

    Source(file.storageReference.storage.toList)
      .splitWhen(_ => true)
      .via(StorageObjectReader(storageEngine, transformation))
      .mergeSubstreams

  }

  /**
    * Reads partially a file, from the starts of the range to end of the range. The reader will drop and ignore every
    * storage object outside of the range, and trim bytes still outside of the wanted range.
    *
    * @param storageEngine The storage engine to use.
    * @param transformation The transformation to apply (decompression, etc..)
    * @param file The file to stream
    * @param range The range of byte to output
    */
  def apply(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed],
    file: File,
    range: Range
  )(implicit ec: ExecutionContext): Source[ByteString, NotUsed] = {

    // We need to compute the storage object that are within the range and that we need to read. We also need the real
    // range of byte taking into account the dropped storage objects. In order to achieve this we fold keeping 3
    // information: the number of bytes read, the start of the range, the end of the range and the list of storage
    // objects to read
    val (_, realFrom, realTo, storageObjectsInRange) =
    file
      .storageReference
      .storage
      .foldLeft((0l, 0l, 0l, Seq.empty[StorageObject])) {
        case ((cursor, from, to, storageObjects), storageObject) =>
          if(range.start > cursor + storageObject.size) {
            // Skip the object (before range start)
            (cursor + storageObject.size, from, to, storageObjects)
          } else if(range.end < cursor) {
            // Skip the object (after range end)
            (cursor + storageObject.size, from, to, storageObjects)
          } else {
            // Object within the start and the end of the range

            val objectFrom = if(range.start > cursor)
              range.start - cursor
            else
              0

            val objectTo = if(range.end < (cursor + storageObject.size))
              range.end - cursor
            else
              storageObject.size

            (
              cursor + storageObject.size,
              if(objectFrom != 0) objectFrom else from,
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

}
