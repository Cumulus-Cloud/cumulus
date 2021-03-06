package io.cumulus.services

import java.time.LocalDateTime
import java.util.UUID

import io.cumulus.Logging
import io.cumulus.persistence.query.{QueryE, QueryPagination, QueryRunner}
import io.cumulus.persistence.query.QueryRunner._
import io.cumulus.persistence.query.QueryE._
import io.cumulus.utils.{EnrichedList, PaginatedList}
import io.cumulus.utils.EnrichedList._
import io.cumulus.validation.AppError
import io.cumulus.models.event.{NodeCreationEvent, NodeDeletionEvent, NodeMoveEvent}
import io.cumulus.models.fs._
import io.cumulus.models.user.User
import io.cumulus.persistence.storage.StorageReference
import io.cumulus.persistence.stores.filters.FsNodeFilter
import io.cumulus.persistence.stores.orderings.FsNodeOrdering
import io.cumulus.persistence.stores.{EventStore, FsNodeStore, SharingStore}
import play.api.libs.json.__

import scala.concurrent.Future


class FsNodeService(
  fsNodeStore: FsNodeStore,
  sharingStore: SharingStore,
  eventStore: EventStore
)(
  implicit
  queryRunner: QueryRunner[Future]
) extends Logging {

  /**
    * Return the index (all the files) for the current user.
    *
    * @param user The user performing the operation.
    */
  def getIndex(implicit user: User): Future[Either[AppError, List[FsNodeIndex]]] = {
    QueryE.lift(fsNodeStore.findIndexByUser(user)).run()
  }

  /**
    * Finds a filesystem node by its path and owner.
    *
    * @param path The path of the node.
    * @param user The user performing the operation.
    */
  def findNode(path: Path)(implicit user: User): Future[Either[AppError, FsNode]] =
    getNode(path).commit()

  /**
    * Finds a filesystem node by its ID.
    *
    * @param id The unique ID of the node.
    * @param user The user performing the operation.
    */
  def findNode(id: UUID)(implicit user: User): Future[Either[AppError, FsNode]] =
    getNode(id).commit()

  /**
    * Finds a file by its ID and owner. Will fail if the element does not exist or is not a file.
    *
    * @param id The unique ID of the file.
    * @param user The user performing the operation.
    */
  def findFile(id: UUID)(implicit user: User): Future[Either[AppError, File]] = {

    for {
      // Find the node
      node <- getNode(id)

      // Check if the node is a file
      file <- QueryE.pure(isFileValidation(node))
    } yield file

  }.commit()

  /**
    * Finds a directory by its ID and owner. Will fail if the element does not exist or is not a directory.
    * @param id The unique ID of the directory.
    * @param user The user performing the operation.
    */
  def findDirectory(id: UUID)(implicit user: User): Future[Either[AppError, Directory]] =
    getDirectory(id).commit()

  /**
    * Finds the content of a directory by its ID and owner. Will fail if the element does not exist or is not a directory.
    *
    * @param id The unique ID of the directory.
    * @param user The user performing the operation.
    * @param pagination The pagination for the contained elements.
    * @param ordering The ordering to use. If changed between paginated result, pages may be incoherent because the
    *                 pages order will be changed.
    */
  def findContent(
    id: UUID,
    pagination: QueryPagination,
    ordering: FsNodeOrdering,
    nodeType: Option[FsNodeType] = None
  )(implicit user: User): Future[Either[AppError, DirectoryWithContent]] = {

    for {
      // Get the directory
      directory <- getDirectory(id)

      // Get the paginated content
      filter = FsNodeFilter("", directory.path, Some(false), nodeType, None, user)
      content <- QueryE.lift(fsNodeStore.findAll(filter, ordering, pagination))

      // Get the total number of entries
      total <- QueryE.lift(fsNodeStore.count(filter))

    } yield DirectoryWithContent(directory, content, total)

  }.commit()

  /**
    * Search through all the user's nodes.
    *
    * @param parent The node parent.
    * @param name The node's partial name.
    * @param nodeType The optional node type.
    * @param pagination The pagination of the research.
    * @param user The user performing the operation.
    */
  def searchNodes(
    parent: Path,
    name: String,
    recursiveSearch: Option[Boolean],
    nodeType: Option[FsNodeType],
    mimeType: Option[String],
    pagination: QueryPagination
  )(implicit user: User): Future[Either[AppError, PaginatedList[FsNode]]] = {
    val filter   = FsNodeFilter(name, parent, recursiveSearch, nodeType, mimeType, user)
    val ordering = FsNodeOrdering.empty

    QueryE.lift(fsNodeStore.findAll(filter, ordering, pagination)).commit()
  }

  /**
    * Check that a new node can be created. Used to non-atomically check for a new file that the uploaded file can be
    * created and to avoid useless computation. Node that verifications will still be made during the final file
    * creation.
    *
    * @param id The parent directory unique ID.
    * @param filename The filename of the file to be soon created.
    * @param user The user performing the operation.
    */
  def checkForNewNode(id: UUID, filename: String)(implicit user: User): Future[Either[AppError, Path]] = {

    for {
      // Get the parent
      parentDirectory <- getDirectory(id)

      // Sanitize the filename
      path <- QueryE.pure {
        val name = Path.sanitize(filename).substring(1)

        if (name.contains("/"))
          Left(AppError.validation("validation.fs-node.invalid-filename", filename))
        else
          Right(parentDirectory.path ++ name)
      }

      // Check if something with the same path already exists for the current user
      _ <- doesntAlreadyExists(path)

    } yield path

  }.commit()

  /**
    * Creates a directory into the user file-system. The path of the directory should be unique and its parent should
    * exists.
    * @param directory The directory to create.
    * @param user The user performing the operation.
    */
  def createDirectory(directory: Directory)(implicit user: User): Future[Either[AppError, Directory]] =
    createNode(directory)

  /**
    * Creates a file (only its metadata - for now) into the user file-system. The path of the file should be unique
    * and its parent should exists.
    * @param file The file to create.
    * @param user The user performing the operation.
    */
  def createFile(file: File)(implicit user: User): Future[Either[AppError, File]] =
    createNode(file)

  /**
    * Set the thumbnail of a file.
    * @param file The updated file.
    * @param thumbnailStorageReference The thumbnail storage reference.
    * @param user The user performing the operation.
    */
  def setThumbnail(
    file: File,
    thumbnailStorageReference: Option[StorageReference]
  )(implicit user: User): Future[Either[AppError, File]] = {

    for {
      // Get the modified file
      node         <- getNodeWithLock(file.path)
      upToDateFile <- QueryE.pure(isFileValidation(node))

      // Add the thumbnail & save the file
      fileWithThumbnail =  upToDateFile.copy(thumbnailStorageReference = thumbnailStorageReference)
      _                 <- QueryE.lift(fsNodeStore.update(fileWithThumbnail))

    } yield fileWithThumbnail

  }.commit()

  /**
    * Set the metadata of a file.
    * @param file The updated file.
    * @param fileMetadata The extracted metadata of the file.
    * @param user The user performing the request.
    */
  def setMetadata(
    file: File,
    fileMetadata: FileMetadata
  )(implicit user: User): Future[Either[AppError, File]] = {

    for {
      // Get the modified file
      node         <- getNodeWithLock(file.path)
      upToDateFile <- QueryE.pure(isFileValidation(node))

      // Add the metadata & save the file
      fileWithMetadata =  upToDateFile.copy(metadata = fileMetadata)
      _                <- QueryE.lift(fsNodeStore.update(fileWithMetadata))

    } yield fileWithMetadata

  }.commit()

  /**
    * Moves nodes to the provided path. The destination should already be a directory.
    * @param ids The unique IDs of the nodes to move.
    * @param to The new path of the node.
    * @param user The user performing the operation.
    */
  def moveNodes(ids: Seq[UUID], to: Path)(implicit user: User): Future[Either[AppError, EnrichedList[FsNode]]] = {

    for {
      // Test that the destination folder exists
      _ <- getNode(to)

      // We need to get the moved node to compute the new paths
      nodes <- QueryE.seq(ids.map(id => QueryE.getOrNotFound(fsNodeStore.findAndLock(id)).query))

      // Then move all the nodes
      movedNodes <- QueryE.seq(nodes.map { node =>
        moveNodeInternal(node.id, to ++ node.name).query
      })

    } yield movedNodes.toEnrichedList

  }.commit()

  /**
    * Moves a node to the provided path. The destination should not already exists and a directory parent.
    * @param id The unique ID of the node to move.
    * @param to The new path of the node.
    * @param user The user performing the operation.
    */
  def moveNode(id: UUID, to: Path)(implicit user: User): Future[Either[AppError, FsNode]] =
    moveNodeInternal(id, to).commit()

  private def moveNodeInternal(id: UUID, to: Path)(implicit user: User): QueryE[FsNode] = {

    for {
      // Search the node & its parent by path and owner
      node       <- getNodeWithLock(id)
      nodeParent <- getParentWithLock(node.path)

      // Test if the moved node is not the fs root
      _ <- QueryE.pure {
        if(node.path.isRoot)
          Left(AppError.validation("validation.fs-node.root-move"))
        else
          Right(())
      }

      // Search the target node
      _ <- doesntAlreadyExists(to)

      // Check that the moved node is not moved inside itself
      _ <- QueryE.pure {
        if(node.nodeType == FsNodeType.DIRECTORY && to.isChildOf(node.path))
          Left(AppError.validation("validation.fs-node.inside-move", node.path))
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

      movedNode = node.moved(to)

      // Generate an event
      _ <- QueryE.lift(eventStore.create(NodeMoveEvent.create(from = node.path, movedNode)))

    } yield movedNode

  }

  /**
    * Deletes nodes in the file system. The deleted node should not be a directory with children, and should not be
    * shared or have any children shared. The content will not be deleted.
    *
    * @param ids The unique IDs of the nodes to be deleted.
    * @param deleteContent If the contained nodes should also be deleted. If set to false, will fail if any node has
    *                        any children.
    * @param user The user performing the operation.
    */
  def deleteNodes(ids: Seq[UUID], deleteContent: Boolean)(implicit user: User): Future[Either[AppError, EnrichedList[FsNode]]] = {

    if (deleteContent)
      QueryE.seq(ids.map(deleteNodeWithContent(_).query)).map(_.toEnrichedList)
    else
      QueryE.seq(ids.map(deleteNodeWithoutContent(_).query)).map(_.toEnrichedList)

  }.commit()

  /**
    * Deletes a node in the file system. The deleted node should not be a directory with children, and should not be
    * shared or have any children shared. The content will not be deleted.
    *
    * @param id The unique ID of the node to be deleted.
    * @param deleteContent If the contained nodes should also be deleted. If set to false, will fail if the node has
    *                        any children.
    * @param user The user performing the operation.
    */
  def deleteNode(id: UUID, deleteContent: Boolean)(implicit user: User): Future[Either[AppError, FsNode]] = {

    if (deleteContent)
      deleteNodeWithContent(id)
    else
      deleteNodeWithoutContent(id)

  }.commit()

  /**
    * Deletes a node in the file system. The deleted node should not be a directory with children, and should not be
    * shared or have any children shared. The content will not be deleted.
    *
    * @param id The unique ID of the node.
    * @param user The user performing the operation.
    */
  private def deleteNodeWithoutContent(id: UUID)(implicit user: User): QueryE[FsNode] = {

    for {
      // Search the node by path and owner
      node <- getNodeWithLock(id)

      // Test if the deleted node is not the fs root
      _ <- QueryE.pure {
        if(node.path.isRoot)
          Left(AppError.validation("validation.fs-node.root-delete"))
        else
          Right(())
      }

      // Check that no children element exists
      _ <- QueryE(fsNodeStore.findContainedByPathAndUser(node.path, user, QueryPagination.first).map {
        case contained if contained.nonEmpty =>
          Left(AppError.validation("validation.fs-node.non-empty", node.path))
        case _ =>
          Right(())
      })

      // Delete the sharings of the node in question
      _ <- QueryE.lift(sharingStore.deleteByNode(node, user))

      // Delete the element
      _ <- QueryE.lift(fsNodeStore.delete(node.id))

      // Update the last modified of the parent
      nodeParent <- getParentWithLock(node.path)
      _          <- QueryE.lift(fsNodeStore.update(nodeParent.modified(LocalDateTime.now)))

      // Generate an event
      _ <- QueryE.lift(eventStore.create(NodeDeletionEvent.create(node, withContent = false)))

    } yield node

  }

  private def deleteNodeWithContent(id: UUID)(implicit user: User): QueryE[FsNode] = {

    for {
      // Search the node by path and owner
      node <- getNodeWithLock(id)

      // Test if the deleted node is not the fs root
      _ <- QueryE.pure {
        if(node.path.isRoot)
          Left(AppError.validation("validation.fs-node.root-delete"))
        else
          Right(())
      }

      // Delete all the sharings of the node and of any of its children
      _ <- QueryE.lift(sharingStore.deleteByParentNode(node, user))

      // Delete the elements
      _ <- QueryE.lift(fsNodeStore.deleteWithContent(node, user))

      // Update the last modified of the parent
      nodeParent <- getParentWithLock(node.path)
      _          <- QueryE.lift(fsNodeStore.update(nodeParent.modified(LocalDateTime.now)))

      // Generate an event
      _ <- QueryE.lift(eventStore.create(NodeDeletionEvent.create(node, withContent = true)))

    } yield node

  }

  /**
    * Creates a node into the filesystem. The path of the node should be unique and its parent should exists.
    * @param node The node to create.
    * @param user The user performing the operation.
    */
  private def createNode[N <: FsNode](node: N)(implicit user: User): Future[Either[AppError, N]] = {

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

      // Generate an event
      _ <- QueryE.lift(eventStore.create(NodeCreationEvent.create(node)))

    } yield node

  }.commit()

  /** Checks that an element doesn't already exists. */
  private def doesntAlreadyExists(path: Path)(implicit user: User) = {
    QueryE {
      fsNodeStore.findByPathAndUser(path, user).map {
        case Some(_: Directory) =>
          Left(AppError.validation(__ \ "path", "validation.fs-node.directory-already-exists", path))
        case Some(_: File) =>
          Left(AppError.validation("validation.fs-node.file-already-exists", path))
        case Some(_) =>
          Left(AppError.validation("validation.fs-node.node-already-exists", path))
        case None =>
          Right(())
      }
    }
  }

  /** Gets a node and returns an error if the node doesn't exist. */
  private def getNode(path: Path)(implicit user: User) =
    QueryE.getOrNotFound(fsNodeStore.findByPathAndUser(path, user))

  /** Gets a node and returns an error if the node doesn't exist. */
  private def getNode(id: UUID)(implicit user: User) = {
    QueryE.getOrNotFound(fsNodeStore.findByIdAndUser(id, user))
  }

  /** Gets a node and lock it for the transaction. */
  private def getNodeWithLock(id: UUID)(implicit user: User) = {
    QueryE.getOrNotFound(fsNodeStore.findAndLockByIdAndUser(id, user))
  }

  /** Gets a node and lock it for the transaction. */
  private def getNodeWithLock(path: Path)(implicit user: User) = {
    QueryE.getOrNotFound(fsNodeStore.findAndLockByPathAndUser(path, user))
  }

  /** Get a directory. */
  private def getDirectory(id: UUID)(implicit user: User) = {
    for {
      // Find the node
      node <- getNode(id)

      // Check if the node is a directory
      directory <- QueryE.pure(isDirectoryValidation(node))
    } yield directory
  }

  /** Checks that a node is a file. */
  private def isFileValidation(node: FsNode): Either[AppError, File] =
    node match {
      case file: File =>
        Right(file)
      case _ =>
        Left(AppError.validation("validation.fs-node.not-file", node.path))
    }

  /** Checks that a node is a directory. */
  private def isDirectoryValidation(node: FsNode): Either[AppError, Directory] =
    node match {
      case directory: Directory =>
        Right(directory)
      case _ =>
        Left(AppError.validation("validation.fs-node.not-directory", node.path))
    }

  /** Gets the parent directory of the element and lock it for the transaction. */
  private def getParentWithLock(path: Path)(implicit user: User): QueryE[Directory] = {
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
