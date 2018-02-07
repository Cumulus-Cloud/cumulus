package io.cumulus.controllers.utils

import akka.stream.scaladsl.Source
import akka.util.ByteString
import io.cumulus.core.utils.Range
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.File
import play.api.http.HttpEntity
import play.api.mvc.Results._
import play.api.mvc.{Request, Result}

trait FileDownloaderUtils {

  protected def headerRange(request: Request[_], file: File): Either[AppError, Option[Range]] = {

    val range = request.headers.get("Range").map { rangeHeader =>
      rangeHeader.split('=').toList match {
        case "bytes" :: r :: Nil => r.split('-').map(_.toLong).toList match {
          case from :: to :: Nil => Range(from, to)
          case from :: Nil => Range(from, file.size - 1)
          case _ => Range(0, file.size - 1)
        }
        case _ => Range(0, file.size - 1)
      }
    }

    range match {
      case Some(Range(_, to)) if to > (file.size - 1) =>
        AppError.notAcceptable("validation.range.range-outside-end")
      case Some(Range(from, _)) if from < 0 =>
        AppError.notAcceptable("validation.range.range-outside-start")
      case Some(Range(from, to)) if to < from =>
        AppError.notAcceptable("validation.range.range-negative")
      case maybeValidRange =>
        Right(maybeValidRange)
    }
  }

  protected def downloadFile(
    file: File,
    content: Source[ByteString, _],
    forceDownload: Boolean
  ): Result =
    downloadFile(file.name, file.size, file.mimeType, content, forceDownload)

  protected def downloadFile(
    fileName: String,
    size: Long,
    mimeType: String,
    content: Source[ByteString, _],
    forceDownload: Boolean
  ): Result = {

    Ok.sendEntity(
      HttpEntity.Streamed(
        content,
        Some(size),
        Some(mimeType)
      )
    )
    .withHeaders(
      if(forceDownload)
        "Content-Disposition" -> s"attachment; filename*=UTF-8''$fileName"
      else
        "Content-Disposition" -> "inline"
    )

  }

  protected def streamFile(
    file: File,
    content: Source[ByteString, _],
    range: Range
  ): Result =
    streamFile(file.size, file.mimeType, content, range)

  protected def streamFile(
    size: Long,
    mimeType: String,
    content: Source[ByteString, _],
    range: Range
  ): Result = {

    PartialContent
      .sendEntity(
        HttpEntity.Streamed(
          content,
          None,
          Some(mimeType)
        )
      )
      .withHeaders(
        ("Content-Transfer-Encoding", "Binary"),
        ("Content-Range", s"bytes ${range.start}-${range.end}/$size"),
        ("Accept-Ranges", "bytes")
      )

  }

}
