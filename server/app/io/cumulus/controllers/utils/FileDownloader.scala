package io.cumulus.controllers.utils

import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream.scaladsl.Flow
import akka.util.ByteString
import io.cumulus.core.stream.storage.StorageReferenceReader
import io.cumulus.core.stream.utils.ByteRange
import io.cumulus.core.utils.Range
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}
import play.api.http.HttpEntity
import play.api.mvc.Result
import play.api.mvc.Results._

trait FileDownloader {

  protected def downloadFile(
    storageEngine: StorageEngine,
    file: File,
    fileTransformation: Flow[ByteString, ByteString, NotUsed],
    forceDownload: Boolean
  )(implicit ec: ExecutionContext): Result = {

    val source = StorageReferenceReader(
      storageEngine,
      fileTransformation,
      file
    )

    Ok.sendEntity(
      HttpEntity.Streamed(
        source,
        Some(file.size),
        Some(file.mimeType)
      )
    )
    .withHeaders(
      if(forceDownload)
        "Content-Disposition" -> s"attachment; filename*=UTF-8''${file.name}"
      else
        "Content-Disposition" -> "inline"
    )

  }

  protected def streamFile(
    storageEngine: StorageEngine,
    file: File,
    fileTransformation: Flow[ByteString, ByteString, NotUsed],
    range: Range
  )(implicit ec: ExecutionContext): Result = {

    val objects = file.storageReference.storage.foldLeft((0l, 0l, 0l, Seq.empty[StorageObject])) {
      case ((cursor, from, to, storageObjects), storageObject) =>
        if(range.start > cursor + storageObject.size) {
          // Skip the object (before range start)
          (cursor + storageObject.size, from, to, storageObjects)
        } else if(range.end < cursor) {
          // Skip the object (after range end)
          (cursor + storageObject.size, from, to, storageObjects)
        } else {

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

    val source = StorageReferenceReader(
      storageEngine,
      fileTransformation,
      file.copy(storageReference = file.storageReference.copy(storage = objects._4)) // TODO better way ?
    ).via(ByteRange(Range(objects._2, objects._3)))

    PartialContent
      .sendEntity(
        HttpEntity.Streamed(
          source,
          None,
          Some(file.mimeType)
        )
      )
      .withHeaders(
        ("Content-Transfer-Encoding", "Binary"),
        ("Content-Range", s"bytes ${range.start}-${range.end}/${file.size}"),
        ("Accept-Ranges", "bytes")
      )

  }

}
