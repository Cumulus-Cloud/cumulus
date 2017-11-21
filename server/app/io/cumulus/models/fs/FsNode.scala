package io.cumulus.models.fs

import java.net.URLEncoder
import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.models.Path
import io.cumulus.persistence.storage.StorageReference
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

  implicit val reads: Reads[FsNode] = {
    case jsObject: JsObject =>
      (jsObject \ "nodeType")
        .asOpt[String]
        .flatMap(FsNodeType.withNameInsensitiveOption) match {
        case Some(FsNodeType.DIRECTORY) =>
          Directory.format.reads(jsObject)
        case Some(FsNodeType.FILE) =>
          File.format.reads(jsObject)
        case other =>
          JsError(__ \ "nodeType", JsonValidationError("validation.fs-node.unknown-type", other))
      }
    case _ =>
      JsError("validation.parsing.cannot-parse")
  }

  implicit val writes: OWrites[FsNode] = {
    case directory: Directory =>
      Directory.format.writes(directory)
    case file: File =>
      File.format.writes(file)
  }

  implicit val format: OFormat[FsNode] =
    OFormat(reads, writes)

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

  def apply(
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

  implicit val format: OFormat[Directory] =
    Json.format[Directory]

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
  storageReference: StorageReference
) extends FsNode {

  def modified(now: LocalDateTime): File =
    copy(modification = now)

  def moved(path: Path): File =
    copy(path = path)

}

object File {

  implicit val format: OFormat[File] =
    Json.format[File]

  def apply(
    id: UUID,
    path: Path,
    creation: LocalDateTime,
    modification: LocalDateTime,
    hidden: Boolean,
    owner: UUID,
    permissions: Seq[Permission],
    metadata: FileMetadata,
    size: Long,
    hash: String,
    mimeType: String,
    storage: StorageReference
  ): File =
    File(
      id,
      path,
      FsNodeType.FILE,
      creation,
      modification,
      hidden,
      owner,
      permissions,
      metadata,
      size,
      hash,
      mimeType,
      storage
    )

  def apply(
    path: Path,
    owner: UUID,
    mimeType: String,
    storage: StorageReference
  ): File = {
    val now = LocalDateTime.now()

    File(
      id = UUID.randomUUID(),
      path = path,
      creation = now,
      modification = now,
      hidden = false,
      owner = owner,
      permissions = Seq.empty,
      metadata = FileMetadata.default,
      size = storage.size,
      hash = storage.hash,
      mimeType = mimeType,
      storage = storage
    )
  }

}
