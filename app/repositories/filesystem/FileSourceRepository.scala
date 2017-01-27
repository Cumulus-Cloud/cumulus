package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm.SqlParser._
import anorm._
import anorm.JodaParameterMetaData._
import models.{FileSource, FsNode}
import org.joda.time.DateTime
import play.api.db.DBApi
import utils.{Conf, Utils}

import scala.concurrent.ExecutionContext

class FileSourceRepository @Inject()(
  dbApi: DBApi,
  conf: Conf
)(
  implicit ec: ExecutionContext
) {

  import FileSourceRepository._

  private[filesystem] def selectSourcesNonAtomic(fileSystemElement: FsNode)(implicit c: Connection): Seq[FileSource] = {
    selectFileChunks(fileSystemElement).as(parser *).map(
      fs => fs.copy(secretKey = fs.secretKey.flatMap(Utils.Crypto.decrypt(_)(conf))) // Decrypt the key
    )
  }

  private[filesystem] def insertNonAtomic(fileSystemElement: FsNode, fileSource: FileSource)(implicit c: Connection) = {
    insertFileSource(
      fileSystemElement,
      fileSource.copy(secretKey = fileSource.secretKey.map(Utils.Crypto.encrypt(_)(conf))) // Encrypt the key
    ).execute()
  }

}

object FileSourceRepository {

  val table = "filesource"

  val parser = {
    get[UUID]("id") ~
    get[BigInt]("size") ~
    get[String]("hash") ~
    get[Option[String]]("cipher") ~
    get[Option[String]]("compression") ~
    get[Option[String]]("secretKey") ~
    get[String]("storage_engine") ~
    get[String]("storage_engine_version") ~
    get[DateTime]("creation") map {
      case id ~ size ~ hash ~ cipher ~ compression ~ secretKey ~ storage_engine ~ storage_engine_version ~ creation
        => FileSource(id, size, hash, cipher, compression, secretKey, storage_engine, storage_engine_version, creation)
    }
  }

  private def selectFileChunks(fileSystemElement: FsNode) = SQL"""
       SELECT * FROM #$table
       WHERE #$table.file_id = ${fileSystemElement.id}::uuid;
    """

  private def insertFileSource(fileSystemElement: FsNode, fileChunk: FileSource) = SQL"""
     INSERT INTO #$table (
       id,
       size,
       hash,
       cipher,
       compression,
       secretKey,
       storage_engine,
       storage_engine_version,
       creation,
       file_id)
     VALUES (
       ${fileChunk.id}::uuid,
       ${fileChunk.size},
       ${fileChunk.hash},
       ${fileChunk.cipher},
       ${fileChunk.compression},
       ${fileChunk.secretKey},
       ${fileChunk.storageEngine},
       ${fileChunk.storageEngineVersion},
       ${fileChunk.creation},
       ${fileSystemElement.id}::uuid
     );
    """
}
