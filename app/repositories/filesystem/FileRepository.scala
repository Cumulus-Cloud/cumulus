package repositories.filesystem

import javax.inject.Inject

import models.{FileMetadata, Account, File, Path}
import play.api.db.DBApi
import repositories.ValidationError

import scala.concurrent.ExecutionContext

class FileRepository @Inject()(
  dbApi: DBApi,
  nodeRepository: FsNodeRepository,
  fileChunkRepository: FileChunkRepository,
  fileMetadataRepository: FileMetadataRepository
)(
 implicit ec: ExecutionContext
){

  /**
    * Default database
    *
    * @return The default database
    */
  private def db = dbApi.database("default") // TODO get from conf

  /**
    * Insert the provided file
    *
    * @see [[FsNodeRepository.insert]]
    */
  def insert(file: File)(implicit account: Account): Either[ValidationError, File] = {
    db.withTransaction { implicit c =>
      nodeRepository.insertNonAtomic(file.node) match {
        case Left(error) => Left(error)
        case Right(node) =>
          // Insert the chunks
          file.chunks.map(fileChunkRepository.insertNonAtomic(file.node, _))
          // Insert the metadatas
          fileMetadataRepository.insertNonAtomic(file.node, file.metadata)
          // Return the inserted file
          Right(file.copy(node))
      }
    }
  }

  /**
    * Return a file by its path, with its content, chunks and metadata
    *
    * @see [[FsNodeRepository.getByPath]]
    */
  def getByPath(path: String)(implicit account: Account): Either[ValidationError, Option[File]] = {
    db.withTransaction { implicit c =>
      nodeRepository.getByPathNonAtomic(path, File.NodeType) match {
        case Left(error) => Left(error)
        case Right(node) =>
          Right(
            node.map { n =>
              val chunks = fileChunkRepository.selectChunks(n)

              File(
                node = n,
                chunks = chunks,
                metadata = fileMetadataRepository.selectMetadata(n)
                  .getOrElse(FileMetadata.initFrom(chunks)) // Should not happen, fallback
              )
            }
          )
      }
    }
  }

  /**
    * Move a file to a new location, along with all the contained file
    *
    * @see [[FsNodeRepository.getByPath]]
    */
  def move(file: File, destinationPath: Path)(implicit account: Account): Either[ValidationError, File] = {
    nodeRepository.move(file.node, destinationPath) match {
      case Left(error) => Left(error)
      case Right(node) => Right(file.copy(node))
    }
  }

  /**
    * Delete the provided file and all the contained directories
    *
    * @see [[FsNodeRepository.getByPath]]
    */
  def delete(file: File)(implicit account: Account): Either[ValidationError, Unit] = {
    nodeRepository.delete(file.node) match {
      case Left(error) => Left(error)
      case Right(_) => Right(Unit)
    }
  }

  // TODO Search file by name/path
}
