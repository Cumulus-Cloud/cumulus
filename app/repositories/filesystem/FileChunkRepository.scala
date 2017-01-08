package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm.SqlParser._
import anorm._
import anorm.JodaParameterMetaData._
import models.{FileChunk, FsNode}
import org.joda.time.DateTime
import play.api.db.DBApi

import scala.concurrent.ExecutionContext

class FileChunkRepository @Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) {

  import FileChunkRepository._

  private[filesystem] def selectChunks(fileSystemElement: FsNode)(implicit c: Connection): Seq[FileChunk] = {
    selectFileChunks(fileSystemElement).as(parser *)
  }

  private[filesystem] def insertNonAtomic(fileSystemElement: FsNode, fileChunk: FileChunk)(implicit c: Connection) = {
    insertFileChunk(fileSystemElement, fileChunk).execute()
  }

}

object FileChunkRepository {

  val table = "filechunk"

  val parser = {
    get[UUID]("id") ~
    get[BigInt]("size") ~
    get[String]("storage_engine") ~
    get[String]("storage_engine_version") ~
    get[DateTime]("creation") ~
    get[Int]("position") ~
    get[String]("hash") map {
      case id ~ size ~ storage_engine ~ storage_engine_version ~ creation ~ position ~ hash
        => FileChunk(id, size, storage_engine, storage_engine_version, creation, position, hash)
    }
  }

  private def selectFileChunks(fileSystemElement: FsNode) = SQL"""
       SELECT * FROM #$table
       WHERE #$table.file_id = ${fileSystemElement.id}::uuid;
    """

  private def insertFileChunk(fileSystemElement: FsNode, fileChunk: FileChunk) = SQL"""
     INSERT INTO #$table (
       id,
       size,
       storage_engine,
       storage_engine_version,
       creation,
       position,
       hash,
       file_id)
     VALUES (
       ${fileChunk.id}::uuid,
       ${fileChunk.size},
       ${fileChunk.storageEngine},
       ${fileChunk.storageEngineVersion},
       ${fileChunk.creation},
       ${fileChunk.position},
       ${fileChunk.hash},
       ${fileSystemElement.id}::uuid
     );
    """
}
