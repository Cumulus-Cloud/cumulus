package io.cumulus.models.fs

import java.net.URLEncoder
import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.core.json.JsonFormat
import io.cumulus.models.Path
import io.cumulus.persistence.storage.StorageReference
import play.api.libs.functional.syntax._
import play.api.libs.json._

sealed trait FsNode {
  def id: UUID
  def path: Path
  def nodeType: FsNodeType
  def creation: LocalDateTime
  def modification: LocalDateTime
  def hidden: Boolean
  def owner: UUID
  def permissions: Seq[Permission]

  def name: String =
    path.name

  def downloadSafeName: String =
    URLEncoder.encode(name, "UTF-8")

  def modified(now: LocalDateTime): FsNode

  def moved(path: Path): FsNode

}

object FsNode {

  private def reads(fileReader: Reads[File], directoryReader: Reads[Directory]): Reads[FsNode] = {
    case jsObject: JsObject =>
      (jsObject \ "nodeType")
        .asOpt[String]
        .flatMap(FsNodeType.withNameInsensitiveOption) match {
        case Some(FsNodeType.DIRECTORY) =>
          directoryReader.reads(jsObject)
        case Some(FsNodeType.FILE) =>
          fileReader.reads(jsObject)
        case other =>
          JsError(__ \ "nodeType", JsonValidationError("validation.fs-node.unknown-type", other))
      }
    case _ =>
      JsError("validation.parsing.cannot-parse")
  }

  private def writes(fileWriter: OWrites[File], directoryWriter: OWrites[Directory]): OWrites[FsNode] = {
    case directory: Directory =>
      directoryWriter.writes(directory)
    case file: File =>
      fileWriter.writes(file)
  }

  implicit val reads: Reads[FsNode]    = reads(File.reads, Directory.reads)
  implicit val writes: OWrites[FsNode] = writes(File.writes, Directory.writes)
  implicit val format: OFormat[FsNode] = OFormat(reads, writes)

  // We want different non-implicit writers en readers for the database
  val internalReads: Reads[FsNode]    = reads(File.internalReads, Directory.internalReads)
  val internalWrites: OWrites[FsNode] = writes(File.internalWrites, Directory.internalWrites)
  val internalFormat: OFormat[FsNode] = OFormat(internalReads, internalWrites)

}

case class Directory(
  id: UUID,
  path: Path,
  nodeType: FsNodeType,
  creation: LocalDateTime,
  modification: LocalDateTime,
  hidden: Boolean,
  owner: UUID,
  permissions: Seq[Permission],
  content: Seq[FsNode]
) extends FsNode {

  def modified(now: LocalDateTime): Directory =
    copy(modification = now)

  def moved(path: Path): Directory =
    copy(path = path)

}

object Directory {

  /** Default newly created directory */
  def create(
    creator: UUID,
    path: Path
  ): Directory = {
    val now = LocalDateTime.now()

    new Directory(
      UUID.randomUUID(),
      path,
      FsNodeType.DIRECTORY,
      now,
      now,
      false,
      creator,
      Seq.empty,
      Seq.empty
    )
  }

  implicit val reads: Reads[Directory] = Json.reads[Directory]

  implicit val writes: OWrites[Directory] = (
    (JsPath \ "id").write[UUID] and
    (JsPath \ "path").write[Path] and
    (JsPath \ "name").write[String] and
    (JsPath \ "nodeType").write[FsNodeType] and
    (JsPath \ "creation").write[LocalDateTime] and
    (JsPath \ "modification").write[LocalDateTime] and
    (JsPath \ "hidden").write[Boolean] and
    (JsPath \ "owner").write[UUID] and
    (JsPath \ "content").lazyWrite[Seq[FsNode]] { content =>
      Writes.traversableWrites[FsNode](FsNode.format).writes(content)
    }
  ){ directory =>
    (
      directory.id,
      directory.path,
      directory.path.name,
      directory.nodeType,
      directory.creation,
      directory.modification,
      directory.hidden,
      directory.owner,
      directory.content
    )
  }

  implicit val format: OFormat[Directory] =
    OFormat(reads, writes)

  // We want different non-implicit writers and readers for the database
  lazy val internalReads: Reads[Directory]    = reads
  lazy val internalWrites: OWrites[Directory] = Json.writes[Directory]
  lazy val internalFormat: OFormat[Directory] = OFormat(internalReads, internalWrites)

}

case class File(
  id: UUID,
  path: Path,
  nodeType: FsNodeType,
  creation: LocalDateTime,
  modification: LocalDateTime,
  hidden: Boolean,
  owner: UUID,
  permissions: Seq[Permission],
  metadata: FileMetadata,
  size: Long,
  hash: String,
  mimeType: String,
  storageReference: StorageReference,
  thumbnailStorageReference: Option[StorageReference]
) extends FsNode {

  def modified(now: LocalDateTime): File =
    copy(modification = now)

  def moved(path: Path): File =
    copy(path = path)

}

object File {

  /** Default newly created file */
  def create(
    owner: UUID,
    path: Path,
    mimeType: String,
    storage: StorageReference
  ): File = {
    val now = LocalDateTime.now()

    File(
      id = UUID.randomUUID(),
      path = path,
      nodeType = FsNodeType.FILE,
      creation = now,
      modification = now,
      hidden = false,
      owner = owner,
      permissions = Seq.empty,
      metadata = DefaultMetadata.empty,
      size = storage.size,
      hash = storage.hash,
      mimeType = mimeType,
      storageReference = storage,
      thumbnailStorageReference = None
    )
  }

  implicit val reads: Reads[File] = Json.reads[File]

  implicit val writes: OWrites[File] = (
    (JsPath \ "id").write[UUID] and
    (JsPath \ "path").write[Path] and
    (JsPath \ "name").write[String] and
    (JsPath \ "nodeType").write[FsNodeType] and
    (JsPath \ "creation").write[LocalDateTime] and
    (JsPath \ "modification").write[LocalDateTime] and
    (JsPath \ "hidden").write[Boolean] and
    (JsPath \ "owner").write[UUID] and
    (JsPath \ "size").write[Long] and
    (JsPath \ "humanReadableSize").write[String] and
    (JsPath \ "hash").write[String] and
    (JsPath \ "mimeType").write[String]and
    (JsPath \ "cipher").writeNullable[String] and
    (JsPath \ "compression").writeNullable[String] and
    (JsPath \ "metadata").write[FileMetadata] and
    (JsPath \ "hasThumbnail").write[Boolean]
  ){ file =>
    (
      file.id,
      file.path,
      file.path.name,
      file.nodeType,
      file.creation,
      file.modification,
      file.hidden,
      file.owner,
      file.size,
      JsonFormat.humanReadable(file.size),
      file.hash,
      file.mimeType,
      file.storageReference.cipher,
      file.storageReference.compression,
      file.metadata,
      file.thumbnailStorageReference.isDefined
    )
  }

  implicit val format: OFormat[File] =
    OFormat(reads, writes)

  // We want different non-implicit writers and readers for the database
  val internalReads: Reads[File]    = reads
  val internalWrites: OWrites[File] = Json.writes[File]
  val internalFormat: OFormat[File] = OFormat(internalReads, internalWrites)

}
