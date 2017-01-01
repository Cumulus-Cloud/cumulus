package models

/**
  * A directory
  * @param node The file system node of the directory
  * @param content The contained directories
  */
case class Directory(
  node: FsNode,
  content: Seq[FsElement]
) extends FsElement

object Directory {

  val NodeType = "directory"

  def initFrom(location: String, creator: Account): Directory = Directory(
    FsNode.initFrom(location, "directory", creator),
    Seq.empty
  )

  def apply(node: FsNode): Directory = new Directory(node, Seq.empty)

}