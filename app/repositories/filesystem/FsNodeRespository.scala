package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm._
import anorm.SqlParser._
import anorm.JodaParameterMetaData._
import org.joda.time.DateTime
import play.api.db.DBApi
import models.{Account, Directory, FsNode, Path}
import repositories.ValidationError

import scala.concurrent.ExecutionContext

class FsNodeRespository @Inject()(
  dbApi: DBApi,
  permissionRepository: PermissionRepository
)(
  implicit ec: ExecutionContext
){

  import FsNodeRespository._

  /**
    * Default database
    * @return The default database
    */
  private def db = dbApi.database("default") // TODO get from conf

  // TODO Delete
  // TODO Search node by name/path ?

  /**
    * Insert the provided directory. The directory will only be inserted if:
    *  - The creator of the directory is the same performing the operation (or is an admin)
    *  - The location doesn't already exists
    *  - The parent already exist
    *  - The user have write rights in the parent
    *
    * @param node The node to insert. The UUID should already be generated and unique
    * @return Either a validation error if the insertion could not be performed, either the inserted node
    */
  def insert(node: FsNode)(implicit account: Account): Either[ValidationError, FsNode] =
    db.withConnection { implicit c =>
      insertNonAtomic(node)(account, c)
    }

  /**
    * @see [[FsNodeRespository.insert()]]
    */
  def insertNonAtomic(node: FsNode)(implicit account: Account, connection: Connection): Either[ValidationError, FsNode] = {
    for {
      // The directory creator should be the same performing the operation
      _ <- account match {
        case _ if node.creator != account && !account.isAdmin
          => Left(ValidationError("location", "The node creator should be the same performing the insert (or be an administrator)"))
        case _ => Right(node)
      }
      // The location should be unique
      sameDir <- selectByPath(node.location) match {
        case Some(_) => Left(ValidationError("location", s"The node '${node.location}' already exists"))
        case None => Right(node)
      }
      // The parent should exist, be a directory and the account have sufficient credentials
      parent <- selectByPath(node.location.parent) match {
        case None => Left(ValidationError("location", s"The parent '${node.location.parent}' of the destination does not exist"))
        case Some(parent)
          if !parent.isDirectory
            => Left(ValidationError("location", "The destination parent should be a directory"))
        case Some(parent)
          if !parent.havePermission(account, "write")
            => Left(ValidationError("location", s"The account does not have sufficient permissions in the parent location '${node.location.parent}'"))
        case Some(parent) => Right(parent)
      }
    } yield {
      val nodeInserted = node.copy(modification = DateTime.now, creation = DateTime.now)

      // Insert the node first
      insertNode(nodeInserted).execute()

      // Then, insert all the permissions related to the directory
      nodeInserted.permissions.foreach({ permission =>
        permissionRepository.insert(nodeInserted, permission)
      })

      // Update the parent directory
      updateNodeModification(node.location).execute()

      nodeInserted
    }
  }


  /**
    * Move a node to a new location, along with all the contained nodes and sub-nodes. The directory
    * will only be moved only if:
    *  - The account has sufficient permission to write in the node
    *  - The account has sufficient permission to write in the target parent node
    *  - The moved node is not the root node
    *  - The target destination does not already exist
    *  - The target destination's parent exists
    *  - The target destination's parent is a directory
    *
    * @param node The node to move
    * @param destinationPath The destination to move to
    * @param account The account to use
    * @return Either a validation error if the node could not be moved, either the moved node
    */
  def move(node: FsNode, destinationPath: Path)(implicit account: Account): Either[ValidationError, FsNode] =
    db.withConnection { implicit c =>
      moveNonAtomic(node, destinationPath)(account, c)
    }

  /**
    * @see [[FsNodeRespository.move()]]
    */
  def moveNonAtomic(node: FsNode, destinationPath: Path)(implicit account: Account, connection: Connection): Either[ValidationError, FsNode] = {
    for {
      // The root directory cannot be moved
      _ <- node match {
        case _ if node.isRoot
          => Left(ValidationError("location", "The root directory cannot be moved"))
        case _ => Right(node)
      }
      // Check if the user have sufficient rights
      _ <- node match {
        case _ if !node.havePermission(account, "write")
          => Left(ValidationError("location", "The account does not have sufficient permissions to move the element"))
        case _ => Right(node)
      }
      // TODO check contained directory permissions if directory ?
      // Check if target directory doesn't exist
      target <- selectByPath(destinationPath) match {
        case Some(_) => Left(ValidationError("location", "The destination already exist"))
        case None => Right(node)
      }
      // Check if the parent destination exist, is a directory, and if the account have sufficient rights
      parent <- selectByPath(node.location.parent) match {
        case None => Left(ValidationError("location", s"The parent '${node.location.parent}' of the destination does not exist"))
        case Some(parent)
          if !parent.isDirectory
            => Left(ValidationError("location", "The destination parent should be a directory"))
        case Some(parent)
          if !parent.havePermission(account, "write")
            => Left(ValidationError("location", s"The account does not have sufficient permissions in the parent location '${node.location.parent}'"))
        case Some(parent) => Right(parent)
      }
    } yield {
      // Move the directory and all of its contained directories
      updateNodeLocation(node, destinationPath).execute

      // Update modification date for node and new node's parent
      updateNodeModification(node.location).execute()
      updateNodeModification(node.location.parent).execute()

      // Update and return
      node.copy(location = destinationPath)
    }
  }

  /**
    * Return a node by its path, using the provided account. The node will be return only if:
    *  - The node exists
    *  - The account has sufficient permission to read the node
    *
    * @param path The path to return
    * @param account The account to use
    * @return Either a validation error if the directory could not be retrieve, either the node
    */
  def getByPath(path: String)(implicit account: Account): Either[ValidationError, Option[FsNode]] =
    db.withConnection { implicit c =>
      getByPathNonAtomic(path)(account, c)
    }

  /**
    * @see [[FsNodeRespository.getByPath()]]
    */
  def getByPathNonAtomic(path: String)(implicit account: Account, connection: Connection): Either[ValidationError, Option[FsNode]] = {
    // Check the the directory exist and can be read
    selectByPath(path) match {
      case Some(node)
        if !node.havePermission(account, "read")
          => Left(ValidationError("location", "The account does not have sufficient permissions"))
      case None => Right(None)
      case Some(node) => Right(Some(node))
    }
  }

  /**
    * Return a node by its path. This is an internal method that should be used carefully,
    * because there is no permission verification
    *
    * @param path The path to use
    * @param c The connection to use
    * @return The directory, if found
    */
  private[filesystem] def selectByPath(path: String)(implicit c: Connection): Option[FsNode] = {
    selectNodeByPath(path).as((parser ~ (PermissionRepository.parser ?)) *).groupBy(_._1).headOption.map {
      case (directory, permissions) =>
        directory.copy(
          permissions = permissions.flatMap(_._2)
        )
    }
  }

}

object FsNodeRespository {

  val table = "fsnode"

  // TODO account placeholder
  val parser = {
    get[UUID]("id") ~
    get[String]("location") ~
    get[String]("name") ~
    get[String]("node_type") ~
    get[DateTime]("creation") ~
    get[DateTime]("modification") map {
      case id ~ location ~ name ~ node_type ~ creation ~ modification
        => FsNode(id, location, name, node_type, creation, modification, Account.initFrom("", "", "") /* TODO */, Seq.empty)
    }
  }

  private def insertNode(node: FsNode) = SQL"""
     INSERT INTO #$table (
       id,
       location,
       name,
       creation,
       modification,
       account_id)
     VALUES (
       ${node.id}::uuid,
       ${node.location.toString},
       ${node.name},
       ${node.creation},
       ${node.modification},
       ${node.creator.id}::uuid
     );
    """

  private def selectNodeByPath(path: String) = SQL"""
       SELECT * FROM #$table
       LEFT JOIN #${PermissionRepository.table}
         ON #$table.id = #${PermissionRepository.table}.directory_id
       WHERE #$table.location = $path;
    """

  private def updateNodeLocation(node: FsNode, destinationPath: Path) = {
    // Match any directory contained (directly or indirectly) and the directory itself
    val regex = s"^${node.location.toString}"

    SQL"""
      UPDATE #$table
      SET location = regexp_replace(#$table.location, $regex, ${destinationPath.toString});
    """
  }

  private def updateNodeModification(path: String) = SQL"""
      UPDATE #$table
      SET modification = NOW()
      WHERE #$table.location = $path;
    """

  private def deleteNode(node: FsNode) = {
    // Match any node contained (directly or indirectly) and the node itself
    val regex = s"^${node.location.toString}"

    // Note : node permissions related to the dropped directories will be automatically dropped
    SQL"""
      DELETE FROM #$table
      WHERE #$table.location ~ $regex;
    """
  }

  // TODO Search directory by name/path

}
