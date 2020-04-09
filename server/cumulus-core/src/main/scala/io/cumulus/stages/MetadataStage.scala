package io.cumulus.stages

import java.time.format.DateTimeFormatter
import java.time.{LocalDateTime, ZoneId}

import akka.stream.Materializer
import akka.stream.scaladsl.StreamConverters
import com.github.ghik.silencer.silent
import com.sksamuel.scrimage
import io.cumulus.stream.storage.StorageReferenceReader
import io.cumulus.validation.AppError
import io.cumulus.models.fs._
import io.cumulus.models.user.session.Session
import io.cumulus.persistence.storage.StorageEngines
import org.apache.pdfbox.pdmodel.PDDocument

import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext
import scala.util.Try


/**
  * Abstract metadata extractor, used to read metadata from an uploaded file.
  */
trait MetadataExtractor {

  def extract(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    session: Session
  ): Either[AppError, FileMetadata]

  def maxSize: Long = 1048576 // 10Mo

  def applyOn: Seq[String]

}

/**
  * Default implementation, returning no metadata.
  */
object DefaultMetadataExtractor extends MetadataExtractor {

  def extract(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    session: Session
  ): Either[AppError, DefaultMetadata] = {
    Right(DefaultMetadata.empty)
  }

  def applyOn: Seq[String] = Seq()

}

/**
  * Implementation for images, using scrimage to read metadata from an image. Exif data are extracted.
  */
object ImageMetadataExtractor extends MetadataExtractor {

  def extract(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    session: Session
  ): Either[AppError, ImageMetadata] = {
    StorageReferenceReader.reader(
      file
    ).map { source =>

      val fileInputStream = source.runWith(StreamConverters.asInputStream())
      val metadata = scrimage.ImageMetadata.fromStream(fileInputStream)

      val make  = metadata.tags.find(_.name == "Make").map(_.value)
      val model = metadata.tags.find(_.name == "Model").map(_.value)

      val latitudeRef = metadata.tags.find(_.name == "GPS Latitude Ref").map(_.value)
      val latitude = metadata.tags.find(_.name == "GPS Latitude").map(_.value)
      val longitudeRef = metadata.tags.find(_.name == "GPS Longitude Ref").map(_.value)
      val longitude = metadata.tags.find(_.name == "GPS Longitude").map(_.value)
      val altitude = metadata.tags.find(_.name == "GPS Altitude").map(_.value)

      val dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss")
      val datetime = metadata.tags.find(_.name == "Date/Time Original").map(t => LocalDateTime.parse(t.value, dateTimeFormatter))

      val pattern = "(\\d+).*".r
      val height = metadata.tags.find(_.name == "Image Height").flatMap { t =>
        t.value match {
          case pattern(heightValue) =>
            Try(heightValue.toLong).toOption
          case _ =>
            None
        }
      }
      val width = metadata.tags.find(_.name == "Image Width").flatMap { t =>
        t.value match {
          case pattern(widthValue) =>
            Try(widthValue.toLong).toOption
          case _ =>
            None
        }
      }

      ImageMetadata.apply(
        maker = make,
        model = model,
        latitudeRef = latitudeRef,
        latitude = latitude,
        longitudeRef = longitudeRef,
        longitude = longitude,
        altitude = altitude,
        datetime = datetime,
        height = height,
        width = width,
        values = Map(
          metadata.tags
            .filter(_.value != null) // Filter out null values
            .map(t => t.name -> t.value.replaceAll("""\u0000""", "")):_*
        ),
        tags = Seq.empty
      )
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

/**
  * Implementation for PDFs, using PDFBox to read the document and extract metadata.
  */
object PDFDocumentMetadataExtractor extends MetadataExtractor {

  def extract(
    file: File
  )(implicit
    ec: ExecutionContext,
    materializer: Materializer,
    ciphers: Ciphers,
    compressions: Compressions,
    storageEngines: StorageEngines,
    session: Session
  ): Either[AppError, PDFDocumentMetadata] = {
    StorageReferenceReader.reader(
      file
    ).map { source =>

      @silent
      var document: PDDocument = null

      try {
        val fileInputStream = source.runWith(StreamConverters.asInputStream())
        document = PDDocument.load(fileInputStream)

        val info = document.getDocumentInformation
        val pageCount: Long = Option(document.getNumberOfPages).map(_.toLong).getOrElse(0)
        val title = Option(info.getTitle)
        val author = Option(info.getAuthor)
        val subject = Option(info.getSubject)
        val tags = Option(info.getKeywords).map(_.split(";").toSeq.filterNot(_.trim.isEmpty)).getOrElse(Seq[String]())
        val creator = Option(info.getCreator)
        val producer = Option(info.getProducer)
        val creation = Option(info.getCreationDate).map(t => t.toInstant.atZone(ZoneId.systemDefault()).toLocalDateTime)
        val modification = Option(info.getModificationDate).map(t => t.toInstant.atZone(ZoneId.systemDefault()).toLocalDateTime)

        val keys = info.getMetadataKeys.asScala
        val values = Map(keys.map(key => Option(info.getCustomMetadataValue(key)).map(v => key -> v)).toSeq.flatten: _*)

        PDFDocumentMetadata(
          pageCount = pageCount,
          title = title,
          author = author,
          subject = subject,
          tags = tags,
          creator = creator,
          producer = producer,
          creationDate = creation,
          modificationDate = modification,
          values = values
        )
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

case class MetadataExtractors(extractors: MetadataExtractor*) {

  def get(name: String): MetadataExtractor =
    extractors
      .find(_.applyOn.contains(name))
      .getOrElse(DefaultMetadataExtractor)

  def get(name: Option[String]): MetadataExtractor =
    name match {
      case Some(n) => get(n)
      case _       => DefaultMetadataExtractor
    }

}
