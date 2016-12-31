package repositories.filesystem

import javax.inject.Inject

import models.{File, Account, Directory, Path}
import play.api.db.DBApi
import repositories.ValidationError

import scala.concurrent.ExecutionContext

class DirectoryRepository @Inject()(
  dbApi: DBApi,
  nodeRepository: FsNodeRepository
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
    * Insert the provided directory
    *
    * @see [[FsNodeRepository.insert()]]
    */
  def insert(directory: Directory)(implicit account: Account): Either[ValidationError, Directory] = {
    nodeRepository.insert(directory.node) match {
      case Left(error) => Left(error)
      case Right(node) => Right(directory.copy(node))
    }
  }

  /**
    * Return a directory by its path, with its content
    *
    * @see [[FsNodeRepository.getByPath()]]
    */
  def getByPath(path: String)(implicit account: Account): Either[ValidationError, Option[Directory]] = {
    db.withTransaction { implicit c =>
      nodeRepository.getByPathNonAtomic(path, Directory.NodeType) match {
        case Left(error) => Left(error)
        case Right(node) =>
          Right(
            node.map { n =>
              Directory(
                node = n,
                // Add the contained directories, but filtered with the read right
                content = nodeRepository.selectContent(n)
                  .filter(_.havePermission(account, "read"))
                  .map({
                    case content if content.isDirectory =>
                      Directory(content)
                    case content if content.isFile =>
                      File(content) // Chunks are only returned when the detailed file is requested
                  })
              )
            }
          )
      }
    }
  }

  /**
    * Move a directory to a new location, along with all the contained directories and sub-directories
    *
    * @see [[FsNodeRepository.getByPath()]]
    */
  def move(directory: Directory, destinationPath: Path)(implicit account: Account): Either[ValidationError, Directory] = {
    nodeRepository.move(directory.node, destinationPath) match {
      case Left(error) => Left(error)
      case Right(node) => Right(directory.copy(node))
    }
  }

  /**
    * Delete the provided directory and all the contained directories
    *
    * @see [[FsNodeRepository.getByPath()]]
    */
  def delete(directory: Directory)(implicit account: Account): Either[ValidationError, Unit] = {
    nodeRepository.delete(directory.node) match {
      case Left(error) => Left(error)
      case Right(_) => Right(Unit)
    }
  }

  // TODO Search directory by name/path
}
