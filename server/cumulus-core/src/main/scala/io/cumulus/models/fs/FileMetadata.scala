package io.cumulus.models.fs

import java.time.LocalDateTime

import play.api.libs.json._

/**
  * File metadata
  */
sealed trait FileMetadata {
  def values: Map[String, String]
  def tags: Seq[String]
}

object FileMetadata {

  private def formatTypeKey = "metadataType"

  implicit def reads: Reads[FileMetadata] = {
    case jsObject: JsObject =>
      (jsObject \ formatTypeKey).asOpt[String] match {
        case Some("DefaultMetadata") =>
          DefaultMetadata.format.reads(jsObject)
        case Some("ImageMetadata") =>
          ImageMetadata.format.reads(jsObject)
        case Some("PDFDocumentMetadata") =>
          PDFDocumentMetadata.format.reads(jsObject)
        case other =>
          JsError(__ \ "nodeType", JsonValidationError("validation.fs-node.unknown-type", other))
      }
    case _ =>
      JsError("validation.parsing.cannot-parse")
  }

  implicit def writes: OWrites[FileMetadata] = {
    case defaultMetadata: DefaultMetadata =>
      DefaultMetadata.format.writes(defaultMetadata) + (formatTypeKey -> JsString("DefaultMetadata"))
    case imageMetadata: ImageMetadata =>
      ImageMetadata.format.writes(imageMetadata) + (formatTypeKey -> JsString("ImageMetadata"))
    case pdfDocumentMetadata: PDFDocumentMetadata =>
      PDFDocumentMetadata.format.writes(pdfDocumentMetadata) + (formatTypeKey -> JsString("PDFDocumentMetadata"))
  }

}

case class DefaultMetadata(
  values: Map[String, String],
  tags: Seq[String]
) extends FileMetadata

object DefaultMetadata {

  def empty: DefaultMetadata = new DefaultMetadata(Map.empty, Seq.empty)

  implicit val format: OFormat[DefaultMetadata] =
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
) extends FileMetadata

object ImageMetadata {

  implicit val format: OFormat[ImageMetadata] =
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
) extends FileMetadata

object PDFDocumentMetadata {

  implicit val format: OFormat[PDFDocumentMetadata] =
    Json.format[PDFDocumentMetadata]

}


