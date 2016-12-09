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

  /*
  // TODO add permissions ?
  // TODO serialize directly fsNode ?
  implicit val directoryWrites: Writes[Directory] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "creation").write[String] and
    (JsPath \ "modification").write[String] and
    //(JsPath \ "creator").write[Account] and
    (JsPath \ "content").writeNullable[Seq[FsElement]] //lazyWriteNullable(Writes.seq[FsElement](directoryWrites))
  )(directory => (
    directory.node.id.toString,
    directory.node.location.toString,
    directory.node.name,
    directory.node.creation.toString,
    directory.node.modification.toString,
    //directory.node.creator,
    if (directory.content.isEmpty) None else Some(directory.content))
  )*/

}