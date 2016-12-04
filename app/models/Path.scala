package models

/**
  * A path, either for a directory or for a for a file
  * @param value The path itself
  */
case class Path(value: Seq[String]) {

  import Path._

  def parent: Path =
    Path(value.dropRight(1))

  override def toString =
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
}