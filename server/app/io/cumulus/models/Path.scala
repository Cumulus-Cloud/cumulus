package io.cumulus.models

import scala.language.implicitConversions

import org.apache.commons.io.FilenameUtils
import play.api.libs.json._
import play.api.mvc.PathBindable

/**
  * A path, either for a directory or for a for a file
  *
  * @param value The path itself
  */
case class Path(value: Seq[String]) {

  import Path._

  /**
    * Concat a path with another string. The provided string will be converted to a path before the conversion.
    * @param next The path to append
    * @return The new path
    */
  def ++(next: String): Path =
    Path(value ++ convertStringToPath(next).value)

  /**
    * Concat a path with a sequence of strings. The provided strings will be converted to paths before the conversion.
    * @param next The path to append
    * @return The new path
    */
  def ++(next: Seq[String]): Path =
    Path(value ++ next.flatMap(convertStringToPath(_).value))

  /**
    * Concat a path with another path
    * @param next The path to append
    * @return The new path
    */
  def ++(next: Path): Path =
    Path(value ++ next.value)

  /**
    * Return if the path is the root path (or `/` ) or not.
    */
  def isRoot: Boolean =
    value.isEmpty

  /**
    * Return the name of the node, aka the last part of the path.
    * @return The name of the element designed by the path.
    */
  def name: String =
    value.lastOption.getOrElse("")

  /**
    * Return the name of the node, aka the last part of the path, without its extension.
    * @return The name of the element designed by the path (without its extension).
    */
  def nameWithoutExtension: String =
    FilenameUtils.getBaseName(name)

  /**
    * Return the parent of the node.
    */
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
    * Trim the location to remove duplicated '/' or trailing '/'
    * @param path Path to trim
    * @return The trimmed path
    */
  def trim(path: String): String = convertStringToPath(path).toString.trim

  /**
    * Clean the location using `java.net.URLDecoder` and [[io.cumulus.models.Path#trim(java.lang.String)]]
    * @param path Path to sanitize
    * @return The sanitized path
    */
  def sanitize(path: String): String = trim(java.net.URLDecoder.decode(path, "UTF-8"))

  implicit val format: Format[Path] =
    new Format[Path] {
      override def reads(json: JsValue): JsResult[Path] = Json.fromJson[String](json).map(Path.convertStringToPath)
      override def writes(o: Path): JsValue             = JsString(o)
    }

  implicit def pathBinder(implicit stringBinder: PathBindable[String]) =
    new PathBindable[Path] {
      def bind(key: String, value: String) = stringBinder.bind(key, value).map(Path.sanitize)
      def unbind(key: String, value: Path) = value.toString
    }

}
