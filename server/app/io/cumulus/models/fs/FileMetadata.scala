package io.cumulus.models.fs

import play.api.libs.json.{Format, Json}

/**
  * File metadata
  *
  * @param size The real size of the file
  * @param hash The real hash of the file
  * @param mimeType The mime type
  */
case class FileMetadata(
  size: Long,
  hash: String,
  mimeType: String
)

object FileMetadata {

  def default = new FileMetadata(
    0,
    "d41d8cd98f00b204e9800998ecf8427e", // MD5 of an empty string/file
    "application/octet-stream"
  )

  implicit val format: Format[FileMetadata] =
    Json.format[FileMetadata]

}
