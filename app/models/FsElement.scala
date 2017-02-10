package models

import play.api.libs.json.{JsPath, Writes}

import play.api.libs.functional.syntax._

trait FsElement {
  def node: FsNode
}

object FsElement {

  implicit val fsElementWrites: Writes[FsElement] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "location").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "type").write[String] and
    (JsPath \ "creation").write[String] and
    (JsPath \ "modification").write[String] and
    (JsPath \ "hidden").write[Boolean] and
    //(JsPath \ "creator").write[Account] and
    (JsPath \ "content").lazyWriteNullable(Writes.seq[FsElement](fsElementWrites)) and
    (JsPath \ "sources").lazyWriteNullable(Writes.seq[FileSource](FileSource.fileSourceWrites))
  )(element => (
    element.node.id.toString,
    element.node.location.toString,
    element.node.name,
    element.node.nodeType,
    element.node.creation.toString,
    element.node.modification.toString,
    element.node.hidden,
    //element.node.creator
    element match {
      case dir: Directory if dir.content.nonEmpty => Some(dir.content)
      case _ => None
    },
    element match {
      case file: File => Some(file.sources)
      case _ => None
    })
  )
}
