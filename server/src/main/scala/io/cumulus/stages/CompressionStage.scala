package io.cumulus.stages

import akka.NotUsed
import akka.stream.scaladsl.{Compression, Flow}
import akka.util.ByteString
import io.cumulus.core.validation.AppError

/**
  * Abstract compression stage used to compress or decompress a file.
  */
trait CompressionStage {

  def name: String

  def compress: Flow[ByteString, ByteString, NotUsed]

  def uncompress: Flow[ByteString, ByteString, NotUsed]

}

/**
  * Handler to return a compression by name.
  * @param compressions List of all the compressions available.
  */
case class Compressions(compressions: CompressionStage*) {

  def get(name: String): Either[AppError, CompressionStage] =
    compressions
      .find(_.name == name.toUpperCase)
      .map(Right.apply)
      .getOrElse(Left(AppError.validation("validation.fs-node.unknown-compression", name)))

  def get(name: Option[String]): Either[AppError, Option[CompressionStage]] =
    name match {
      case Some(n) => get(n).map(Some(_))
      case _       => Right(None)
    }

}

/**
  * Compression stage using GZip.
  *
  * @see [[https://doc.akka.io/japi/akka/current/akka/stream/scaladsl/Compression$.html Compression.gzip]]
  * @see [[https://doc.akka.io/japi/akka/current/akka/stream/scaladsl/Compression$.html Compression.gunzip]]
  */
object GzipStage extends CompressionStage {

  def name: String = "GZIP"

  def compress: Flow[ByteString, ByteString, NotUsed] =
    Compression.gzip

  def uncompress: Flow[ByteString, ByteString, NotUsed] =
    Compression.gunzip()

}

/**
  * Compression stage using deflate.
  *
  * @see [[https://doc.akka.io/japi/akka/current/akka/stream/scaladsl/Compression$.html Compression.deflate]]
  * @see [[https://doc.akka.io/japi/akka/current/akka/stream/scaladsl/Compression$.html Compression.inflate]]
  */
object DeflateStage extends CompressionStage {

  def name: String = "DEFLATE"

  def compress: Flow[ByteString, ByteString, NotUsed] =
    Compression.deflate

  def uncompress: Flow[ByteString, ByteString, NotUsed] =
    Compression.inflate()

}
