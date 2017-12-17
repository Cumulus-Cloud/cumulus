package io.cumulus.stages

import java.io.{ByteArrayInputStream, ByteArrayOutputStream}
import javax.imageio.ImageIO
import scala.concurrent.{ExecutionContext, Future}

import akka.stream.Materializer
import akka.stream.scaladsl.{Keep, StreamConverters}
import com.sksamuel.scrimage.Image
import com.sksamuel.scrimage.nio.JpegWriter
import io.cumulus.core.Settings
import io.cumulus.core.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.core.validation.AppError
import io.cumulus.models.UserSession
import io.cumulus.models.fs.File
import io.cumulus.persistence.storage.StorageEngine
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.rendering.{ImageType, PDFRenderer}

trait ThumbnailGenerator {

  def generate(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    userSession: UserSession,
    settings: Settings
  ): Future[Either[AppError, File]]

  def maxSize: Long = 1048576 // 10Mo

  def applyOn: Seq[String]

}

object PDFDocumentThumbnailGenerator extends ThumbnailGenerator {

  override def generate(
    file: File,
    storageEngine: StorageEngine
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    userSession: UserSession,
    settings: Settings) = {


    val res = for {
      fileSource  <- StorageReferenceReader(storageEngine, file)
      cipher      <- ciphers.get(file.storageReference.cipher)
      compression <- compressions.get(file.storageReference.compression)
    } yield {

      // Get the PDF document
      val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
      val document = PDDocument.load(fileInputStream)
      val pdfRenderer = new PDFRenderer(document)

      // Generate a preview of the first page
      val preview = pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB)

      // Write the image and get a stream
      val os = new ByteArrayOutputStream()
      ImageIO.write(preview, "png", os)
      val is = new ByteArrayInputStream(os.toByteArray)

      // Write the image
      // TODO also move that to a common location
      val thumbnailWriter =
      StorageReferenceWriter(
        storageEngine,
        cipher,
        compression,
        file.path.parent ++ "/" ++ ".thumbnail_" + file.path.nameWithoutExtension + ".png"
      )

      StreamConverters.fromInputStream(() => is).toMat(thumbnailWriter)(Keep.right)
    }

    // Run the upload & return the file
    res match { // TODO move to a common location
      case Right(stream) =>
        stream.run().map(file => Right(file.copy(hidden = true))) // Hide the file
      case Left(err) =>
        Future.successful(Left(err))
    }
  }

  override def applyOn = Seq(
    "application/pdf"
  )

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
    userSession: UserSession,
    settings: Settings): Future[Either[AppError, File]] = {

    val res = for {
      fileSource  <- StorageReferenceReader(storageEngine, file)
      cipher      <- ciphers.get(file.storageReference.cipher)
      compression <- compressions.get(file.storageReference.compression)
    } yield {

      // Generate the image
      val fileInputStream = fileSource.runWith(StreamConverters.asInputStream())
      val image = Image.fromAwt(ImageIO.read(fileInputStream)).fit(200, 200)

      // Write the image
      // TODO also move that to a common location
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
    res match { // TODO move to a common location
      case Right(stream) =>
        stream.run().map(file => Right(file.copy(hidden = true))) // Hide the file
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

