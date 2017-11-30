package io.cumulus.stages

import akka.NotUsed
import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.core.validation.AppError

trait CompressionStage {

  def name: String

  def compress: Flow[ByteString, ByteString, NotUsed]

  def uncompress: Flow[ByteString, ByteString, NotUsed]

}

case class Compressions(compressions: Map[String, CompressionStage]) {

  def get(name: String): Either[AppError, CompressionStage] =
    compressions.get(name.toUpperCase)
      .map(Right.apply)
      .getOrElse(Left(AppError.validation("validation.fs-node.unknown-compression", name)))

  def get(name: Option[String]): Either[AppError, Option[CompressionStage]] =
    name match {
      case Some(n) => get(n).map(Some(_))
      case _       => Right(None)
    }

}

object GzipStage extends CompressionStage {

  def name: String = "GZIP"

  def compress: Flow[ByteString, ByteString, NotUsed] =
    Flow[ByteString].via(Compression.gzip)

  def uncompress: Flow[ByteString, ByteString, NotUsed] =
    Flow[ByteString].via(Compression.gunzip())

}

object DeflateStage extends CompressionStage {

  def name: String = "DEFLATE"

  def compress: Flow[ByteString, ByteString, NotUsed] =
    Flow[ByteString].via(Compression.deflate)

  def uncompress: Flow[ByteString, ByteString, NotUsed] =
    Flow[ByteString].via(Compression.inflate())

}
