package io.cumulus.controllers.utils

import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream.scaladsl.Flow
import akka.util.ByteString
import io.cumulus.core.stream.storage.StorageReferenceReader
import io.cumulus.core.utils.Range
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.StorageEngine
import play.api.http.HttpEntity
import play.api.mvc.Results._
import play.api.mvc.{Request, Result}

trait FileDownloaderUtils {

  protected def headerRange(request: Request[_], file: File): Range = {
    val headerRange: (Long, Long) =
      request.headers.get("Range").getOrElse("bytes=0-").split('=').toList match {
        case "bytes" :: r :: Nil => r.split('-').map(_.toLong).toList match {
          case from :: to :: Nil => (from, to)
          case from :: Nil => (from, -1)
          case _ => (0, -1)
        }
        case _ => (0, -1)
      }

    // TODO check validity & return 406 if not
    Range(
      headerRange._1,
      if(headerRange._2 > 0) headerRange._2 else file.size - 1
    )
  }

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

    val source = StorageReferenceReader(
      storageEngine,
      fileTransformation,
      file,
      range
    )

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
