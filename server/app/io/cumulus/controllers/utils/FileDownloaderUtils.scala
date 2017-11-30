package io.cumulus.controllers.utils

import scala.concurrent.ExecutionContext

import io.cumulus.core.stream.storage.StorageReferenceReader
import io.cumulus.core.utils.Range
import io.cumulus.core.validation.AppError
import io.cumulus.models.Session
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.StorageEngine
import io.cumulus.stages.{Ciphers, Compressions}
import play.api.http.HttpEntity
import play.api.mvc.Results._
import play.api.mvc.{Request, Result}

trait FileDownloaderUtils {

  protected def headerRange(request: Request[_], file: File): Either[AppError, Range] = {

    val range = request.headers.get("Range").getOrElse("bytes=0-").split('=').toList match {
      case "bytes" :: r :: Nil => r.split('-').map(_.toLong).toList match {
        case from :: to :: Nil => Range(from, to)
        case from :: Nil => Range(from, file.size - 1)
        case _ => Range(0, file.size - 1)
      }
      case _ => Range(0, file.size - 1)
    }

    range match {
      case Range(_, to) if to > (file.size - 1) =>
        AppError.notAcceptable("validation.range.range-outside-end")
      case Range(from, _) if from < 0 =>
        AppError.notAcceptable("validation.range.range-outside-start")
      case Range(from, to) if to < from =>
        AppError.notAcceptable("validation.range.range-negative")
      case validRange =>
        Right(validRange)
    }
  }

  protected def downloadFile(
    storageEngine: StorageEngine,
    file: File,
    forceDownload: Boolean
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    ec: ExecutionContext
  ): Either[AppError, Result] = {

    StorageReferenceReader(
      storageEngine,
      file
    ).map { source =>

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

  }

  protected def streamFile(
    storageEngine: StorageEngine,
    file: File,
    range: Range
  )(implicit
    session: Session,
    ciphers: Ciphers,
    compressions: Compressions,
    ec: ExecutionContext
  ): Either[AppError, Result] = {

    StorageReferenceReader(
      storageEngine,
      file,
      range
    ).map { source =>

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

}
