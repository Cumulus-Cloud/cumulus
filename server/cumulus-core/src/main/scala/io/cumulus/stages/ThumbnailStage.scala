package io.cumulus.stages

import akka.stream.Materializer
import akka.stream.scaladsl.{Keep, StreamConverters}
import com.sksamuel.scrimage.Image
import com.sksamuel.scrimage.nio.JpegWriter
import io.cumulus.{Logging, Settings}
import io.cumulus.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.validation.AppError
import io.cumulus.models.fs.File
import io.cumulus.models.user.session.UserSession
import io.cumulus.persistence.storage.{StorageEngines, StorageReference}
import javax.imageio.ImageIO
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.rendering.{ImageType, PDFRenderer}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}


trait ThumbnailGenerator extends Logging {

  /** JPEG writer at 50% quality */
  implicit private val writer: JpegWriter = JpegWriter().withCompression(50)

  /** Generate a thumbnail of a file. */
  final def generate(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    userSession: UserSession,
    settings: Settings
  ): Future[Either[AppError, StorageReference]] = {

    val res = for {
      preview         <- generatePreview(file)
      cipher          <- ciphers.get(file.storageReference.cipher.map(_.name))
      compression     <- compressions.get(file.storageReference.compression)
      thumbnailWriter <- {
        StorageReferenceWriter.writer(
          storageEngines.default, // Write the thumbnail on the default storage engine
          cipher,
          compression,
          "/not-used" // We need a name, but will just retrieve the storage information
        )
      }
    } yield {

      // Generate a thumbnail from the preview
      val image =
        Try(Image.fromAwt(preview)) match {
          case Failure(error) =>
            throw new Exception(
              "Image.fromAwt could not decode the image. The image may be in a non-standard format " +
              "or simply not an image but another file type with an image's extension.",
              error
            )
          case Success(readImage) =>
            readImage.fit(200, 200)
        }

      // Write the image
      StreamConverters.fromInputStream(() => image.stream).toMat(thumbnailWriter)(Keep.right)

    }

    // Run the upload & return the file
    res match {
      case Right(stream) =>
        logger.debug(s"Creating thumbnail of file ${file.path}")
        stream.run().map(file => Right(file.storageReference)) // Get the storage reference
      case Left(err) =>
        logger.warn(s"Thumbnail creation of file ${file.path} failed")
        Future.successful(Left(err))
    }

  }

  /** Generate the preview image of the file. Note that the preview can be of any size. */
  protected def generatePreview(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    userSession: UserSession,
    settings: Settings
  ): Either[AppError, java.awt.Image]

  def maxSize: Long = 1048576 // 10Mo

  def applyOn: Seq[String]

}

object ThumbnailGenerator {

  val thumbnailMimeType: String = "image/jpg"

}

/**
  * Thumbnail generator for PDF file. The PDF will be read to generate the thumbnail. This generator use PDFBox as
  * the backend.
  */
object PDFDocumentThumbnailGenerator extends ThumbnailGenerator {

  def generatePreview(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    userSession: UserSession,
    settings: Settings): Either[AppError, java.awt.Image] = {

    StorageReferenceReader.reader(file).map { fileSource =>
      var document: PDDocument = null

      try {
        // Get the PDF document
        val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
        document = PDDocument.load(fileInputStream)
        val pdfRenderer = new PDFRenderer(document)

        // Generate a preview of the first page
        pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB)
      } finally {
        if(document != null)
          document.close()
      }
    }
  }

  def applyOn: Seq[String] = Seq(
    "application/pdf"
  )

}

/**
  * Thumbnail generator for an image. The image will be read to generate the thumbnail. This generator use scrimage as
  * the backend.
  */
object ImageThumbnailGenerator extends ThumbnailGenerator {

  def generatePreview(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    userSession: UserSession,
    settings: Settings): Either[AppError, java.awt.Image] = {

    StorageReferenceReader.reader(file).map { fileSource =>
      // Read the image
      val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
      ImageIO.read(fileInputStream)
    }

  }

  def applyOn: Seq[String] = Seq(
    "image/bmp",
    "image/gif",
    "image/x-icon",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff"
  )

}

case class ThumbnailGenerators(generators: ThumbnailGenerator*) {

  def get(name: String): Option[ThumbnailGenerator] =
    generators
      .find(_.applyOn.contains(name))

  def get(name: Option[String]): Option[ThumbnailGenerator] =
    name.flatMap(get)

}
