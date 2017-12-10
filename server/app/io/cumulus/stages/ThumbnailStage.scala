package io.cumulus.stages

import scala.concurrent.{ExecutionContext, Future}

import akka.stream.Materializer
import akka.stream.scaladsl.{Keep, StreamConverters}
import com.sksamuel.scrimage.Image
import com.sksamuel.scrimage.nio.JpegWriter
import io.cumulus.core.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.core.validation.AppError
import io.cumulus.models.Session
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.StorageEngine

trait ThumbnailGenerator {

  def generate(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    session: Session
  ): Future[Either[AppError, File]]

  def maxSize: Long = 1048576 // 10Mo

  def applyOn: Seq[String]

}

object ImageThumbnailGenerator extends ThumbnailGenerator {

  /** JPEG writer at 50% quality */
  implicit private val writer = JpegWriter().withCompression(50)

  override def generate(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    session: Session) = {

    val res = for {
      fileSource <- StorageReferenceReader(storageEngine, file)
      cipher <- ciphers.get(file.storageReference.cipher)
      compression <- compressions.get(file.storageReference.compression)
    } yield {

      // Generate the image
      val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
      val image = Image.fromStream(fileInputStream).fit(100, 100)

      // Write the image
      val thumbnailWriter =
        StorageReferenceWriter(
          storageEngine,
          cipher,
          compression,
          file.path.parent ++ "/" ++ ".thumbnail_" + file.path.nameWithoutExtension + ".jpg"
        )

      StreamConverters.fromInputStream(() => image.stream).toMat(thumbnailWriter)(Keep.right)
    }

    // Run the upload & return the file
    res match {
      case Right(stream) =>
        stream.run().map(Right.apply)
      case Left(err) =>
        Future.successful(Left(err))
    }

  }

  override def applyOn = Seq(
    "image/bmp",
    "image/gif",
    "image/x-icon",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff"
  )

}

case class ThumbnailGenerators(generators: Seq[ThumbnailGenerator]) {

  def get(name: String): Option[ThumbnailGenerator] =
    generators
      .find(_.applyOn.contains(name))

  def get(name: Option[String]): Option[ThumbnailGenerator] =
    name.flatMap(get)

}

