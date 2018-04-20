package io.cumulus.core.utils

import java.net.URLConnection

object MimeType {

  /** Default mime type */
  private val default = "application/octet-stream"

  /**
    * Detect the mime type of a file, based in its filename.
    *
    * @see [[https://docs.oracle.com/javase/8/docs/api/java/net/URLConnection.html#guessContentTypeFromName-java.lang.String- URLConnection.guessContentTypeFromName]]
    * @param fileName The name of file.
    */
  def detect(fileName: String): String = {
    Option(URLConnection.guessContentTypeFromName(fileName))
      .getOrElse(default)
  }

}
