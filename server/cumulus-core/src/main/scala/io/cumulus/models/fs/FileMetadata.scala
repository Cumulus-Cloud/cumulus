package io.cumulus.models.fs

import java.time.LocalDateTime

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}
import io.cumulus.utils.Enum.enumReader
import play.api.libs.json._

import scala.collection.immutable



sealed abstract class FileMetadataType extends EnumEntry

object FileMetadataType extends Enum[FileMetadataType] with PlayJsonEnum[FileMetadataType] {

  case object DefaultMetadata extends FileMetadataType
  case object ImageMetadata extends FileMetadataType
  case object PDFDocumentMetadata extends FileMetadataType

  override val values: immutable.IndexedSeq[FileMetadataType] = findValues

}

/**
  * File metadata
  */
sealed trait FileMetadata {
  def metadataType: FileMetadataType
  def values: Map[String, String]
  def tags: Seq[String]
}

object FileMetadata {

  implicit def reads: Reads[FileMetadata] =
    (json: JsValue) =>
      enumReader[FileMetadataType]("metadataType")
        .reads(json)
        .flatMap {
          case FileMetadataType.DefaultMetadata =>
            DefaultMetadata.format.reads(json)
          case FileMetadataType.ImageMetadata =>
            ImageMetadata.format.reads(json)
          case FileMetadataType.PDFDocumentMetadata =>
            PDFDocumentMetadata.format.reads(json)
        }

  implicit def writes: OWrites[FileMetadata] =
    (metadata: FileMetadata) =>
      (metadata match {
        case defaultMetadata: DefaultMetadata =>
          DefaultMetadata.format.writes(defaultMetadata)
        case imageMetadata: ImageMetadata =>
          ImageMetadata.format.writes(imageMetadata)
        case pdfDocumentMetadata: PDFDocumentMetadata =>
          PDFDocumentMetadata.format.writes(pdfDocumentMetadata)
      }) ++ Json.obj("metadataType" -> metadata.metadataType)

}

case class DefaultMetadata(
  values: Map[String, String],
  tags: Seq[String]
) extends FileMetadata {

  def metadataType: FileMetadataType =
    FileMetadataType.DefaultMetadata

}

object DefaultMetadata {

  def empty: DefaultMetadata = new DefaultMetadata(Map.empty, Seq.empty)

  private[models] val format: OFormat[DefaultMetadata] =
    Json.format[DefaultMetadata]

}

case class ImageMetadata(
  maker: Option[String],
  model: Option[String],
  latitudeRef: Option[String],
  latitude: Option[String],
  longitudeRef: Option[String],
  longitude: Option[String],
  altitude: Option[String],
  datetime: Option[LocalDateTime],
  height: Option[Long],
  width: Option[Long],
  values: Map[String, String],
  tags: Seq[String]
) extends FileMetadata {

  def metadataType: FileMetadataType =
    FileMetadataType.ImageMetadata

}

object ImageMetadata {

  private[models] val format: OFormat[ImageMetadata] =
    Json.format[ImageMetadata]

}

case class PDFDocumentMetadata(
  pageCount: Long,
  title: Option[String],
  author: Option[String],
  subject: Option[String],
  creator: Option[String],
  producer: Option[String],
  creationDate: Option[LocalDateTime],
  modificationDate: Option[LocalDateTime],
  values: Map[String, String],
  tags: Seq[String]
) extends FileMetadata {

  def metadataType: FileMetadataType =
    FileMetadataType.PDFDocumentMetadata

}

object PDFDocumentMetadata {

  private[models] val format: OFormat[PDFDocumentMetadata] =
    Json.format[PDFDocumentMetadata]

}


