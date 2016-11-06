package repositories

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm._
import anorm.SqlParser._
import anorm.JodaParameterMetaData._
import models.{DirectoryPath, Account, DirectoryPermission, Directory}
import models.DirectoryPath._
import org.joda.time.DateTime
import play.api.db.DBApi

import utils.EitherUtils._

import scala.concurrent.ExecutionContext

class DirectoryRepository @Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) extends BaseRepository[Directory](
  dbApi.database("default"),
  DirectoryRepository.table,
  DirectoryRepository.parser)
{

  import DirectoryRepository._

  /**
    * Insert the provided directory. The directory will only be inserted if:
    *  - The creator of the directory is the same performing the operation (or is an admin)
    *  - The location doesn't already exists
    *  - The parent already exist
    *  - The user have write rights in the parent
    *
    * @param directory The directory to insert. The UUID should already be generated and unique
    * @return Either a validation error if the insertion could not be performed, either the inserted directory
    */
  def insert(directory: Directory)(implicit account: Account): Either[ValidationError, Directory] = {
    db.withTransaction { implicit c =>
      for {
        // The directory creator should be the same performing the operation
        _ <- account match {
          case _ if directory.creator != account && !account.isAdmin
            => Left(ValidationError("location", "The directory creator should be the same performing the insert (or be an administrator)"))
          case _ => Right(directory)
        }
        // The location should be unique
        sameDir <- getByPathWithSession(directory.location) match {
          case Some(_) => Left(ValidationError("location", s"The location '${directory.location}' is already used"))
          case None => Right(directory)
        }
        // The parent should exist and the account have sufficient credentials
        parentDir <- getByPathWithSession(directory.location.parent) match {
          case None => Left(ValidationError("location", s"The parent location '${directory.location.parent}' does not exist"))
          case Some(parent)
            if !parent.havePermission(account, "write")
              => Left(ValidationError("location", s"The account does not have sufficient permissions in the parent location '${directory.location.parent}'"))
          case Some(parent) => Right(parent)
        }
      } yield {
        // Insert the directory first
        insertDirectory(directory).execute()

        // Then, insert all the permissions related to the directory
        directory.permissions.foreach({ permission =>
          insertDirectoryPermission(directory, permission).execute()
        })

        // Update the parent directory
        updateDirectoryModification(parentDir.location).execute()

        directory
      }
    }
  }

  /**
    * Return a directory by its path, using the provided account. The directory will be return only if:
    *  - The directory exist
    *  - The account has sufficient permission to read the directory
    * Contained directories will also be returned, but only readable directories will be present
    *
    * @param path The path to return
    * @param account The account to use
    * @return Either a validation error if the directory could not be retrieve, either the directory
    */
  def getByPath(path: String)(implicit account: Account): Either[ValidationError, Option[Directory]] =
    db.withConnection { implicit c =>
      for {
        // Check the the directory exist and can be read
        directory <- getByPathWithSession(path) match {
          case Some(directory)
            if !directory.havePermission(account, "read")
              => Left(ValidationError("location", "The account does not have sufficient permissions"))
          case None => Right(None)
          case Some(directory) => Right(Some(directory))
        }
      } yield {
        // Add the contained directories, but filtered with the read right
        directory.map { d =>
          d.copy(content = getContent(d).filter(_.havePermission(account, "read")))
        }
        // TODO Add contained files
      }
    }

  /**
    * Move a directory to a new location, along with all the contained directories and sub-directories. The directory
    * will only be moved only if:
    *  - The account has sufficient permission to write in the directory
    *  - The account has sufficient permission to write in the target parent directory
    *  - The moved account is not the root account
    *  - The target destination does not already exist
    *
    * @param directory The directory to move
    * @param destinationPath The destination to move to
    * @param account The account to use
    * @return Either a validation error if the directory could not be moved, either the moved directory
    */
  def move(directory: Directory, destinationPath: DirectoryPath)(implicit account: Account): Either[ValidationError, Directory] = {
    db.withTransaction { implicit c =>
      for {
        // The root directory cannot be moved
        _ <- directory match {
          case _ if directory.isRoot
            => Left(ValidationError("location", "The root directory cannot be moved"))
          case _ => Right(directory)
        }
        // Check if the user have sufficient rights
        _ <- directory match {
          case _ if !directory.havePermission(account, "write")
            => Left(ValidationError("location", "The account does not have sufficient permissions to move the directory"))
          case _ => Right(directory)
        }
        // TODO check contained directory permissions
        // Check if target directory doesn't exist
        target <- getByPathWithSession(destinationPath) match {
          case Some(_) => Left(ValidationError("location", "The destination directory already exist"))
          case None => Right(directory)
        }
        // Check if the parent destination exist and if the account have sufficient rights
        parent <- getByPathWithSession(destinationPath.parent) match {
          case Some(dir) if dir.havePermission(account, "write") => Right(dir)
          case Some(_) => Left(ValidationError("location", "The account does not have sufficient permissions to edit the parent of the destination directory"))
        }
      } yield {
        // Move the directory and all of its contained directories
        moveDirectory(directory, destinationPath).execute
        // TODO Move files

        // Update and return
        directory.copy(location = destinationPath)
      }
    }
  }

  /**
    * Delete the provided directory and all the contained directories. The directory will only be deleted if:
    *  - The account has sufficient permission to write in the directory
    *  - The deleted account is not the root account
    *
    * @param directory The directory to delete
    * @param account The account to use
    * @return Either a validation error if the directory could not be deleted, either nothing
    */
  def delete(directory: Directory)(implicit account: Account): Either[ValidationError, Unit] = {
    db.withConnection { implicit c =>
      for {
        // The root directory cannot be deleted
        _ <- directory match {
          case _ if directory.isRoot
            => Left(ValidationError("location", "The root directory cannot be deleted"))
          case _ => Right(directory)
        }
        // Check if the user have sufficient rights
        _ <- directory match {
          case _ if !directory.havePermission(account, "write")
            => Left(ValidationError("location", "The account does not have sufficient permissions"))
          case _ => Right(directory)
        }
      } yield {
        // Delete the directory
        deleteDirectory(directory).execute()
        // TODO Delete contained files
      }
    }
  }

  // TODO Search directory by name/path

  /**
    * Return the content of a directory. This is an internal method that should be used carefully,
    * because there is no permission verification
    *
    * @param directory The directory to use
    * @return All the contained directories
    */
  private def getContent(directory: Directory): Seq[Directory] = {
    db.withTransaction { implicit c =>
      // TODO also get permissions
      selectDirectoryContent(directory).as(parser *)
    }
  }

  private def getByPathWithSession(path: String)(implicit c: Connection): Option[Directory] = {
    selectDirectoryByPath(path).as((parser ~ (parserPermission ?)) *).groupBy(_._1).headOption.map {
      case (directory, permissions) =>
        directory.copy(
          permissions = permissions.flatMap(_._2)
        )
    }
  }
}

object DirectoryRepository {

  val table = "directory"
  val tablePermissions = "directory_permission"

  // TODO account placeholder
  val parser = {
    get[UUID]("id") ~
    get[String]("location") ~
    get[String]("name") ~
    get[DateTime]("creation") ~
    get[DateTime]("modification") map {
      case id ~ location ~ name ~ creation ~ modification
        => Directory(id, location, name, creation, modification, Account.initFrom("", "", "") /* TODO */, Seq.empty, Seq.empty)
    }
  }

  val parserPermission = {
    get[UUID]("account_id") ~
    get[Array[String]]("permissions")  map {
      case account_id ~ permissions
      => DirectoryPermission(account_id, permissions)
    }
  }

  private def updateDirectoryModification(path: String) = SQL"""
       UPDATE #$table
       SET modification = NOW()
       WHERE #$table.location = $path;
    """

  private def selectDirectoryByPath(path: String) = SQL"""
       SELECT * FROM #$table
       LEFT JOIN #$tablePermissions
         ON #$table.id = #$tablePermissions.directory_id
       WHERE #$table.location = $path;
    """

  private def selectDirectoryContent(directory: Directory) = {
    // Match directory starting by the location, but only on the direct level
    val regex = if (directory.isRoot) "^/[^/]+$" else s"^${directory.location.toString}/[^/]+$$"

    SQL"""
       SELECT * FROM #$table
       WHERE #$table.location ~ $regex;
    """
  }

  private def insertDirectory(directory: Directory) = SQL"""
     INSERT INTO #$table (
       id,
       location,
       name,
       creation,
       modification,
       account_id)
     VALUES (
       ${directory.id}::uuid,
       ${directory.location.toString},
       ${directory.name},
       ${directory.creation},
       ${directory.modification},
       ${directory.creator.id}::uuid
     );
    """

  private def insertDirectoryPermission(directory: Directory, directoryPermission: DirectoryPermission) = SQL"""
     INSERT INTO #$tablePermissions (
       account_id,
       directory_id,
       permissions)
     VALUES (
       ${directoryPermission.accountId}::uuid,
       ${directory.id}::uuid,
       ${directoryPermission.permissions.toArray[String]}
     );
    """

  private def moveDirectory(directory: Directory, destinationPath: DirectoryPath) = {
    // Match any directory contained (directly or indirectly) and the directory itself
    val regex = s"^${directory.location.toString}"

    SQL"""
      UPDATE #$table
      SET location = regexp_replace(#$table.location, $regex, ${destinationPath.toString});
    """
  }

  private def deleteDirectory(directory: Directory) = {
    // Match any directory contained (directly or indirectly) and the directory itself
    val regex = s"^${directory.location.toString}"

    // Note : directory permissions related to the dropped directories will be automatically dropped
    SQL"""
      DELETE FROM #$table
      WHERE #$table.location ~ $regex;
    """
  }



  // TODO Delete directory
  // TODO Move/Rename directory
  // TODO Search directory by name/path
}
