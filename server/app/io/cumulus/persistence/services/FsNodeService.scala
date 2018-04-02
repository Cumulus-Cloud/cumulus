package io.cumulus.persistence.services

import java.time.LocalDateTime
import scala.concurrent.{ExecutionContext, Future}

import io.cumulus.core.Logging
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE, QueryPagination}
import io.cumulus.core.validation.AppError
import io.cumulus.models._
import io.cumulus.models.fs._
import io.cumulus.persistence.stores.{FsNodeFilter, FsNodeStore, SharingStore}
import play.api.libs.json.__

class FsNodeService(
  fsNodeStore: FsNodeStore,
  sharingStore: SharingStore
)(
  implicit
  ec: ExecutionContext,
  qb: QueryBuilder[CumulusDB]
) extends Logging {

  /**
    * Finds a file by its path and owner. Will fail if the element does not exist or is not a file.
    * @param path The path of the file.
    * @param user The user performing the operation.
    */
  def findFile(path: Path)(implicit user: User): Future[Either[AppError, File]] = {

    for {
      // Find the node
      node <- find(path)

      // Check if the node is a file
      file <- QueryE.pure {
        node match {
          case file: File =>
            Right(file)
          case _ =>
            Left(AppError.validation("validation.fs-node.not-file", path))
        }
      }
    } yield file

  }.commit()

  /**
    * Finds a directory by its path and owner. Will fail if the element does not exist or is not a directory.
    * @param path The path of the directory.
    * @param user The user performing the operation.
    */
  def findDirectory(path: Path)(implicit user: User): Future[Either[AppError, Directory]] = {

    for {
      // Find the node
      node <- find(path)

      // Check if the node is a directory
      directory <- QueryE.pure {
        node match {
          case directory: Directory =>
            Right(directory)
          case _ =>
            Left(AppError.validation("validation.fs-node.not-directory", path))
        }
      }
    } yield directory

  }.commit()

  /**
    * Finds a filesystem node by its path and owner. If the node is a directory, it will also contains the contained
    * nodes.
    * @param path The path of the node.
    * @param user The user performing the operation.
    */
  def findNode(path: Path)(implicit user: User): Future[Either[AppError, FsNode]] =
    find(path).commit()

  /** Find a node by path and owner */
  private def find(path: Path)(implicit user: User): QueryE[CumulusDB, FsNode] = {

    for {
      // Search the node by path and owner
      node <- getNode(path)

      // Update the node if the node is a directory
      updatedNode <- {
        node match {
          // For directory we want to find the contained fsNode, so we need an extra query
          case directory: Directory =>
            QueryE.lift(fsNodeStore.findContainedByPathAndUser(path, user)).map(c => directory.copy(content = c))
          case other: FsNode =>
            QueryE.pure(other)
        }
      }
    } yield updatedNode

  }

  /**
    * Search a node by name.
    * @param parent The node parent.
    * @param name The node's partial name.
    * @param nodeType The optional node type.
    * @param user The user performing the operation.
    */
  def searchNodes(
    parent: Path,
    name: String,
    nodeType: Option[FsNodeType],
    mimeType: Option[String]
  )(implicit user: User): Future[Either[AppError, Seq[FsNode]]] = {
    val filter = FsNodeFilter(name, parent, nodeType, mimeType, user)

    fsNodeStore
      .findAll(filter, QueryPagination(51, None))
      .commit()
      .map(nodes => Right(nodes.filterNot(_.path.isRoot))) // Ignore the root folder
  }

  /**
    * Check that a new node can be created. Used to non-atomically check for a new file that the uploaded file can be
    * created and to avoid useless computation. Node that verifications will still be made during the final file
    * creation.
    *
    * @param path The new file path.
    * @param user The user performing the operation.
    */
  def checkForNewNode(path: Path)(implicit user: User): Future[Either[AppError, Path]] = {

    for {
      // Check if something with the same path already exists for the current user
      _ <- doesntAlreadyExists(path)

      // Check that the parent exists and is a directory
      _ <- getParent(path)

    } yield path

  }.commit()

  /**
    * Creates a directory into the user file-system. The path of the directory should be unique and its parent should
    * exists.
    * @param directory The directory to create.
    * @param user The user performing the operation.
    */
  def createDirectory(directory: Directory)(implicit user: User): Future[Either[AppError, Directory]] =
    createNode(directory).map(_.map(_ => directory))

  /**
    * Creates a file (only its metadata - for now) into the user file-system. The path of the file should be unique
    * and its parent should exists.
    * @param file The file to create.
    * @param user The user performing the operation.
    */
  def createFile(file: File)(implicit user: User): Future[Either[AppError, File]] =
    createNode(file).map(_.map(_ => file))

  /**
    * Moves a node to the provided path. The destination should not already exists and a directory parent.
    * @param path The node to move.
    * @param to The new path of the node.
    * @param user The user performing the operation.
    */
  def moveNode(path: Path, to: Path)(implicit user: User): Future[Either[AppError, FsNode]] = {

    for {
      // Test if the moved node is not the fs root
      _ <- QueryE.pure {
        if(path.isRoot)
          Left(AppError.validation("validation.fs-node.root-move"))
        else
          Right(())
      }

      // Search the node & its parent by path and owner
      node       <- getNodeWithLock(path)
      nodeParent <- getParentWithLock(node.path)

      // Search the target node
      _ <- doesntAlreadyExists(to)

      // Check that the moved node is not moved inside itself
      _ <- QueryE.pure {
        if(node.nodeType == FsNodeType.DIRECTORY && to.isChildOf(path))
          Left(AppError.validation("validation.fs-node.inside-move", path))
        else
          Right(())
      }

      // Check that the destination's parent exists and is a directory
      movedParentNode <- getParentWithLock(to)

      // Move the directory and update the parent last modification
      now = LocalDateTime.now
      _ <- QueryE.lift(fsNodeStore.update(movedParentNode.modified(now)))
      _ <- QueryE.lift(fsNodeStore.update(nodeParent.modified(now)))
      _ <- QueryE.lift(fsNodeStore.update(node.modified(now)))
      _ <- QueryE.lift(fsNodeStore.moveFsNode(node, to, user)) // Will also move any contained sub-folder
    } yield node.moved(to)

  }.commit()

  /**
    * Deletes a node in the file system. The deleted node should ne be a directory with children, and should not be
    * shared or have any children shared. The content will not be deleted.
    *
    * @param path The path of the node.
    * @param user The user performing the operation.
    */
  def deleteNode(path: Path)(implicit user: User): Future[Either[AppError, FsNode]] = {

    for {
      // Test if the deleted node is not the fs root
      _ <- QueryE.pure {
        if(path.isRoot)
          Left(AppError.validation("validation.fs-node.root-delete"))
        else
          Right(())
      }

      // Search the node by path and owner
      node <- getNodeWithLock(path)

      // Check that no children element exists
      _ <- QueryE(fsNodeStore.findContainedByPathAndUser(path, user).map {
        case contained if contained.nonEmpty =>
          Left(AppError.validation("validation.fs-node.non-empty", path))
        case _ =>
          Right(())
      })

      // Find the sharings of the node in question & delete them all
      sharings <- QueryE.lift(sharingStore.findAndLockByNode(node))
      _        <- QueryE.seq(sharings.map(sharing => sharingStore.delete(sharing.id).map(Right(_))))

      // Delete the element
      _ <- QueryE.lift(fsNodeStore.delete(node.id))

      // Update the last modified of the parent
      nodeParent <- getParentWithLock(node.path)
      _          <- QueryE.lift(fsNodeStore.update(nodeParent.modified(LocalDateTime.now)))

    } yield node

  }.commit()

  /**
    * Creates a node into the filesystem. The path of the node should be unique and its parent should exists.
    * @param node The node to create.
    * @param user The user performing the operation.
    */
  private def createNode(node: FsNode)(implicit user: User): Future[Either[AppError, FsNode]] = {

    for {
      // Check is the user is the owner
      _ <- QueryE.pure {
        if(node.owner != user.id)
          Left(AppError.validation(__ \ "owner", "validation.fs-node.creator-diff"))
        else
          Right(())
      }

      // Check if something with the same path already exists for the current user
      _ <- doesntAlreadyExists(node.path)

      // Check that the parent exists and is a directory
      nodeParent <- getParentWithLock(node.path)

      // Update the last modified of the parent & create the directory
      _ <- QueryE.lift(fsNodeStore.update(nodeParent.modified(node.creation)))
      _ <- QueryE.lift(fsNodeStore.create(node))

    } yield node

  }.commit()

  /** Checks that an element doesn't already exists. */
  private def doesntAlreadyExists(path: Path)(implicit user: User) = {
    QueryE {
      fsNodeStore.findByPathAndUser(path, user).map {
        case Some(_: Directory) =>
          Left(AppError.validation(__ \ "path", "validation.fs-node.directory-already-exists", path))
        case Some(_: File) =>
          Left(AppError.validation(__ \ "path", "validation.fs-node.file-already-exists", path))
        case Some(_) =>
          Left(AppError.validation(__ \ "path", "validation.fs-node.node-already-exists", path))
        case None =>
          Right(())
      }
    }
  }

  /** Get a node and returns an error if the node doesn't exist. */
  private def getNode(path: Path)(implicit user: User) = {
    QueryE.getOrNotFound(fsNodeStore.findByPathAndUser(path, user))
  }

  /** Get a node and lock it for the transaction */
  private def getNodeWithLock(path: Path)(implicit user: User) = {
    QueryE.getOrNotFound(fsNodeStore.findAndLockByPathAndUser(path, user))
  }

  /** Gets the parent directory of the element or returns a not found error. */
  private def getParent(path: Path)(implicit user: User) = {
    QueryE {
      fsNodeStore.findByPathAndUser(path.parent, user).map {
        case Some(directory: Directory) =>
          Right(directory)
        case _ =>
          Left(AppError.validation(__ \ "path", "validation.fs-node.no-parent", path.parent))
      }
    }
  }

  /** Gets the parent directory of the element and lock it for the transaction. */
  private def getParentWithLock(path: Path)(implicit user: User) = {
    QueryE {
      fsNodeStore.findAndLockByPathAndUser(path.parent, user).map {
        case Some(directory: Directory) =>
          Right(directory)
        case _ =>
          Left(AppError.validation(__ \ "path", "validation.fs-node.no-parent", path.parent))
      }
    }
  }

}
