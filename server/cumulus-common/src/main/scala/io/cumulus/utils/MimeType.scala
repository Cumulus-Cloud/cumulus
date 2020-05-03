package io.cumulus.utils

import com.typesafe.config.ConfigFactory

object MimeType {

  /** Default mime type */
  private val default = "application/octet-stream"

  private val mimeTypes = ConfigFactory.load("mime-types.properties")

  /**
    * Detect the mime type of a file, based in its filename.
    *
    * @see [[https://docs.oracle.com/javase/8/docs/api/java/net/URLConnection.html#guessContentTypeFromName-java.lang.String- URLConnection.guessContentTypeFromName]]
    * @param fileName The name of file.
    */
  def detect(fileName: String): String = {
    val regex = """.*\.(\w+)""".r

    fileName match {
      case regex(ext) if mimeTypes.hasPath(ext) =>
        mimeTypes.getString(ext)
      case _ =>
        default
    }
  }

}
