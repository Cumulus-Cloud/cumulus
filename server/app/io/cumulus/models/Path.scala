package io.cumulus.models

import scala.language.implicitConversions

import play.api.libs.json._

/**
  * A path, either for a directory or for a for a file
  *
  * @param value The path itself
  */
case class Path(value: Seq[String]) {

  import Path._

  def isRoot: Boolean =
    value.isEmpty

  def name: String =
    value.lastOption.getOrElse("")

  def parent: Path =
    Path(value.dropRight(1))

  override def toString: String =
    convertPathToStr(this)

}

object Path {

  implicit def convertPathToStr(path: Path): String =
    "/" + path.value.mkString("/")

  implicit def convertPathToSeq(path: Path): Seq[String] =
    path.value

  implicit def convertStringToPath(path: String): Path =
    Path(path.split("/").filterNot(_.isEmpty))

  implicit def convertSeqToPath(path: Seq[String]): Path =
    Path(path.filterNot(_.isEmpty))

  /**
    * Clean the location to remove duplicated '/' or trailing '/'
    * @param path Path to clean
    * @return The sanitized path
    */
  def trim(path: String): String = convertStringToPath(path).toString.trim

  def sanitize(path: String): String = trim(java.net.URLDecoder.decode(path, "UTF-8"))

  implicit val format: Format[Path] =
    new Format[Path] {
      override def reads(json: JsValue): JsResult[Path] = Json.fromJson[String](json).map(Path.convertStringToPath)
      override def writes(o: Path): JsValue             = JsString(o)
    }

}
