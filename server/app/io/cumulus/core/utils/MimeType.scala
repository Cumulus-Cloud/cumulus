package io.cumulus.core.utils

import java.net.URLConnection

object MimeType {

  private val default = "application/octet-stream"

  def detect(fileName: String): String = {
    Option(URLConnection.guessContentTypeFromName(fileName))
      .getOrElse(default)
  }

}
