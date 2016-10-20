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

  // TODO insert root in the base

  def insert(directory: Directory)(implicit account: Account): Either[ValidationError, Directory] = {
    db.withTransaction { implicit c =>
      for {
        // The location should be unique
        sameDir <- getByPathWithSession(directory.location) match {
          case Some(_) => Left(ValidationError("location", "The location is already used"))
          case None => Right(Directory)
        }
        // The parent should exist and the account have sufficient credentials
        parentDir <- getByPathWithSession(directory.location.parent) match {
          case None => Left(ValidationError("location", s"The parent location does not exist"))
          case Some(parent)
            if parent.permissions.count(p => p.accountId == account.id && p.permissions.contains("write")) <= 0
              => Left(ValidationError("location", "The account does not have sufficient permissions in the parent location"))
          case Some(parent) => Right(parent)
        }
      } yield {
        // Insert the directory first
        insertDirectory(directory)

        // Then, insert all the permissions related to the directory
        directory.permissions.foreach({ permission =>
          insertDirectoryPermission(directory, permission)
        })

        // Update the parent directory
        updateDirectoryModification(parentDir.location)

        directory
      }
    }
  }

  def getByPath(path: String): Option[Directory] =
    db.withConnection { implicit c =>
      getByPathWithSession(path)
    }

  private def getByPathWithSession(path: String)(implicit c: Connection): Option[Directory] = {
    selectDirectoryByPath(path).as((parser ~ (parserPermission ?)).*).groupBy(_._1).headOption.map {
      case (directory, permissions) => directory.copy(permissions = permissions.flatMap(_._2))
    }
  }

  // TODO Delete directory
  // TODO Move/Rename directory
  // TODO Search directory by name/path
}

object DirectoryRepository {

  val table = "directory"
  val tablePermissions = "directory_permission"

  val parser = {
    get[UUID]("id") ~
    get[String]("location") ~
    get[String]("name") ~
    get[DateTime]("creation") ~
    get[DateTime]("modification") map {
      case id ~ location ~ name ~ creation ~ modification
        => Directory(id, location, name, creation, modification, None, Seq())
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
       SET #$table.modification = NOW()
       WHERE #$table.location = $path;
    """

  private def selectDirectoryByPath(path: String) = SQL"""
       SELECT * FROM #$table
       LEFT JOIN #$tablePermissions
         ON #$table.id = #$tablePermissions.directory_id
       WHERE #$table.location = $path;
    """

  private def insertDirectory(directory: Directory) = SQL"""
     INSERT INTO #$table (
       id,
       location,
       name,
       creation,
       modification,
       creator,
       roles)
     VALUES (
       ${directory.id}::uuid,
       ${directory.location.toString},
       ${directory.name},
       ${directory.creation},
       ${directory.modification},
       ${directory.creator.get.id}::uuid
     )
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
     )
    """

  // TODO Delete directory
  // TODO Move/Rename directory
  // TODO Search directory by name/path
}
