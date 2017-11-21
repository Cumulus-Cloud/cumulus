package io.cumulus.core.stream.storage

import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream.scaladsl.{Flow, Source}
import akka.util.ByteString
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.StorageEngine

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

}
