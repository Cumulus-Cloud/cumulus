package io.cumulus.models

import scala.language.implicitConversions

import org.apache.commons.io.FilenameUtils
import play.api.libs.json._
import play.api.mvc.PathBindable

/**
  * A path, either for a directory or for a for a file.
  * @param value The path itself.
  */
case class Path(value: Seq[String]) {

  import Path._

  /**
    * Concat a path with another string. The provided string will be converted to a path before the conversion.
    * @param next The path to append.
    * @return The new path.
    */
  def ++(next: String): Path =
    Path(value ++ convertStringToPath(next).value)

  /**
    * Concat a path with a sequence of strings. The provided strings will be converted to paths before the conversion.
    * @param next The path to append.
    * @return The new path.
    */
  def ++(next: Seq[String]): Path =
    Path(value ++ next.flatMap(convertStringToPath(_).value))

  /**
    * Concat a path with another path.
    * @param next The path to append.
    * @return The new path.
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
    * Return the name of the node, a.k.a. the last part of the path, without its extension.
    * @return The name of the element designed by the path (without its extension).
    */
  def nameWithoutExtension: String =
    FilenameUtils.getBaseName(name)

  /**
    * Return the parent of the node.
    */
  def parent: Path =
    Path(value.dropRight(1))

  /**
    * Check if the current path starts with the provided path.
    * {{{
    *   Path("/a/b").isChildrenOf(Path("/a/b/c")) == true
    * }}}
    * @param path The path to test.
    * @return True if the provided path is a child of the current path.
    */
  def isChildOf(path: Path): Boolean =
    this.value.startsWith(path.value)

  /**
    * Check if the provided path starts with the current path.
    * {{{
    *   Path("/a/b/c").isParentOf(Path("/a/b")) == true
    * }}}
    * @param path The path to test.
    * @return True if the provided path is a child of the current path.
    */
  def isParentOf(path: Path): Boolean =
    path.value.startsWith(this.value)

  /**
    * Return the relative path of a path compared with a parent path. If the two path are not related, the provided
    * path will be returned unchanged.
    * {{{
    *   Path("/a/b/c").relativeTo(Path("/a/b")) == "/c"
    * }}}
    *
    * @param path The parent path, which will be used to compute the relative path of the current path.
    * @return The computed relative path from `path` of the current path.
    */
  def relativeTo(path: Path): Path = {
    if(path.isParentOf(this))
      Path(this.value.drop(path.value.size))
    else
      this
  }

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
    * Trim the location to remove duplicated '/' or trailing '/'.
    * @param path Path to trim.
    * @return The trimmed path.
    */
  def trim(path: String): String = convertStringToPath(path).toString.trim

  /**
    * Clean the location using [[java.net.URLDecoder.decode URLDecoder]] and
    * [[io.cumulus.models.Path$#trim(java.lang.String) Path.trim]].
    * @param path Path to sanitize.
    * @return The sanitized path.
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
