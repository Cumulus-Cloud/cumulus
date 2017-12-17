package io.cumulus.stages

import javax.imageio.ImageIO
import scala.concurrent.{ExecutionContext, Future}

import akka.stream.Materializer
import akka.stream.scaladsl.{Keep, StreamConverters}
import com.sksamuel.scrimage.Image
import com.sksamuel.scrimage.nio.JpegWriter
import io.cumulus.core.{Logging, Settings}
import io.cumulus.core.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.core.validation.AppError
import io.cumulus.models.UserSession
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.StorageEngine
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.rendering.{ImageType, PDFRenderer}

trait ThumbnailGenerator extends Logging {

  /** Generate the preview image of the file. Note that the preview can be of any size. */
  def generatePreview(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    userSession: UserSession,
    settings: Settings
  ): Either[AppError, java.awt.Image]

  /** JPEG writer at 50% quality */
  implicit private val writer = JpegWriter().withCompression(50)

  /** Generate a thumbnail of a file. */
  final def generate(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    userSession: UserSession,
    settings: Settings
  ): Future[Either[AppError, File]] = {

    val res = for {
      preview     <- generatePreview(file, storageEngine)
      cipher      <- ciphers.get(file.storageReference.cipher)
      compression <- compressions.get(file.storageReference.compression)
    } yield {

      // Generate a thumbnail from the preview
      val image = Image.fromAwt(preview).fit(200, 200)

      // Write the image
      val thumbnailName = file.path.parent ++ "/" ++ ".thumbnail_" + file.path.nameWithoutExtension + ".jpg"
      val thumbnailWriter =
        StorageReferenceWriter(
          storageEngine,
          cipher,
          compression,
          thumbnailName
        )

      StreamConverters.fromInputStream(() => image.stream).toMat(thumbnailWriter)(Keep.right)
    }

    // Run the upload & return the file
    res match {
      case Right(stream) =>
        logger.debug(s"Creating thumbnail of file ${file.path}")
        stream.run().map(file => Right(file.copy(hidden = true))) // Hide the file
      case Left(err) =>
        logger.warn(s"Thumbnail creation of file ${file.path} failed")
        Future.successful(Left(err))
    }

  }

  def maxSize: Long = 1048576 // 10Mo

  def applyOn: Seq[String]

}

object PDFDocumentThumbnailGenerator extends ThumbnailGenerator {

  override def generatePreview(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    userSession: UserSession,
    settings: Settings): Either[AppError, java.awt.Image] = {

    StorageReferenceReader(storageEngine, file).map { fileSource =>
      // Get the PDF document
      val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
      val document = PDDocument.load(fileInputStream)
      val pdfRenderer = new PDFRenderer(document)

      // Generate a preview of the first page
      pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB)
    }
  }

  override def applyOn = Seq(
    "application/pdf"
  )

}

object ImageThumbnailGenerator extends ThumbnailGenerator {

  override def generatePreview(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    userSession: UserSession,
    settings: Settings): Either[AppError, java.awt.Image] = {

    StorageReferenceReader(storageEngine, file).map { fileSource =>
      // Read the image
      val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
      ImageIO.read(fileInputStream)
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

