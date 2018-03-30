package io.cumulus.core.utils

import java.net.URLConnection

object MimeType {

  /** Default mime type */
  private val default = "application/octet-stream"

  /**
    * Detect the mime type of a file, based in its filename.
    *
    * @see [[java.net.URLConnection#guessContentTypeFromName]]
    * @param fileName The name of file.
    */
  def detect(fileName: String): String = {
    Option(URLConnection.guessContentTypeFromName(fileName))
      .getOrElse(default)
  }

}
