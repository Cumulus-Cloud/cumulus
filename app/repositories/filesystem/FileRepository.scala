package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm.SqlParser._
import anorm._
import models.{Account, File}
import org.joda.time.DateTime
import play.api.db.DBApi
import repositories.{BaseRepository, ValidationError}
import utils.EitherUtils._

import scala.concurrent.ExecutionContext

class FileRepository @Inject()(
 dbApi: DBApi,
 directoryRepository: DirectoryRepository,
 permissionRepository: PermissionRepository
)(
 implicit ec: ExecutionContext
) extends BaseRepository[File](
  dbApi.database("default"),
  FileRepository.table,
  FileRepository.parser
) {

  import FileRepository._

  /**
    * Insert the provided file. The file will only be inserted if:
    *  - The creator of the file is the same performing the operation (or is an admin)
    *  - The file doesn't already exists
    *  - The parent already exist
    *  - The user have write rights in the parent
    *
    * @param file The file to insert. The UUID should already be generated and unique
    * @return Either a validation error if the insertion could not be performed, either the inserted file
    */
  def insert(file: File)(implicit account: Account): Either[ValidationError, File] = {
    db.withTransaction { implicit c =>
      for {
        // The file creator should be the same performing the operation
        _ <- account match {
          case _ if file.creator != account && !account.isAdmin
            => Left(ValidationError("location", "The file creator should be the same performing the insert (or be an administrator)"))
          case _ => Right(file)
        }
        // The location should be unique
        sameDir <- selectByPath(file.location) match {
          case Some(_) => Left(ValidationError("location", s"A file named '${file.location}' already exist"))
          case None => Right(file)
        }
        // The parent should exist and the account have sufficient credentials
        parentDir <- directoryRepository.selectByPath(file.location.parent) match {
          case None => Left(ValidationError("location", s"The parent location '${file.location.parent}' does not exist"))
          case Some(parent)
            if !parent.havePermission(account, "write")
              => Left(ValidationError("location", s"The account does not have sufficient permissions in the parent location '${file.location.parent}'"))
          case Some(parent) => Right(parent)
        }
      } yield {
        // Insert the file first
        insertFile(file).execute()

        // Then, insert all the permissions related to the file
        file.permissions.foreach({ permission =>
          permissionRepository.insert(file, permission)
        })

        // Update the parent directory
        directoryRepository.updateModificationDate(parentDir)

        file
      }
    }
  }

  /**
    * Return a file by its path, using the provided account. The file will be return only if:
    *  - The file exists
    *  - The account has sufficient permission to read the file
    *
    * @param path The path of the file to return
    * @param account The account to use
    * @return Either a validation error if the file could not be retrieve, either the file
    */
  def getByPath(path: String)(implicit account: Account): Either[ValidationError, Option[File]] = {
    db.withConnection { implicit c =>
      for {
        // Check the the directory exist and can be read
        file <- selectByPath(path) match {
          case Some(file)
            if !file.havePermission(account, "read")
              => Left(ValidationError("location", "The account does not have sufficient permissions"))
          case None => Right(None)
          case Some(file) => Right(Some(file))
        }
      } yield {
        // TODO Add chunks
        file
      }
    }
  }

  // TODO move

  // TODO delete

  private[filesystem] def selectByPath(path: String)(implicit c: Connection): Option[File] = {
    selectFileByPath(path).as((parser ~ (PermissionRepository.parser ?)) *).groupBy(_._1).headOption.map {
      case (file, permissions) =>
        file.copy(
          permissions = permissions.flatMap(_._2)
        )
    }
  }
}

object FileRepository {

  val table = "file"

  // TODO account placeholder
  // TODO chunks
  val parser = {
    get[UUID]("id") ~
    get[String]("location") ~
    get[String]("name") ~
    get[DateTime]("creation") ~
    get[DateTime]("modification") map {
      case id ~ location ~ name ~ creation ~ modification
        => File(id, location, name, creation, modification, Account.initFrom("", "", "") /* TODO */, Seq.empty, Seq.empty)
    }
  }

  private def insertFile(file: File) = SQL"""
     INSERT INTO #$table (
       id,
       location,
       name,
       creation,
       modification,
       account_id)
     VALUES (
       ${file.id}::uuid,
       ${file.location.toString},
       ${file.name},
       NOW(),
       NOW(),
       ${file.creator.id}::uuid
     );
    """

  private def selectFileByPath(path: String) = SQL"""
       SELECT * FROM #$table
       LEFT JOIN #${PermissionRepository.table}
         ON #$table.id = #${PermissionRepository.table}.directory_id
       WHERE #$table.location = $path;
    """
}

