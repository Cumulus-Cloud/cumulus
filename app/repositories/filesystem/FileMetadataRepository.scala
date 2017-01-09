package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm.SqlParser._
import anorm._
import models.{FileMetadata, FsNode}
import play.api.db.DBApi

import scala.concurrent.ExecutionContext

class FileMetadataRepository @Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) {

  import FileMetadataRepository._

  private[filesystem] def selectMetadata(fileSystemElement: FsNode)(implicit c: Connection): Option[FileMetadata] = {
    selectFileMetadata(fileSystemElement).as(parser *).headOption
  }

  private[filesystem] def insertNonAtomic(fileSystemElement: FsNode, fileMetadata: FileMetadata)(implicit c: Connection) = {
    insertFileMetadata(fileSystemElement, fileMetadata).execute()
  }

}

object FileMetadataRepository {

  val table = "filemetadata"

  val parser = {
    get[UUID]("id") ~
    get[BigInt]("size") ~
    get[String]("mime_type") map {
      case id ~ size ~ mime_type
        => FileMetadata(id, size, mime_type)
    }
  }

  private def selectFileMetadata(fileSystemElement: FsNode) = SQL"""
       SELECT * FROM #$table
       WHERE #$table.file_id = ${fileSystemElement.id}::uuid;
    """

  private def insertFileMetadata(fileSystemElement: FsNode, fileMetadata: FileMetadata) = SQL"""
     INSERT INTO #$table (
       id,
       size,
       mime_type,
       file_id)
     VALUES (
       ${fileMetadata.id}::uuid,
       ${fileMetadata.size},
       ${fileMetadata.mimeType},
       ${fileSystemElement.id}::uuid
     );
    """
}
