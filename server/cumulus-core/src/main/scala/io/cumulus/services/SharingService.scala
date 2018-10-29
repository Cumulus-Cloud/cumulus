package io.cumulus.services

import java.time.LocalDateTime
import java.util.UUID

import akka.util.ByteString
import io.cumulus.core.Logging
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE, QueryPagination}
import io.cumulus.core.utils.{Base16, Crypto, PaginatedList}
import io.cumulus.core.validation.AppError
import io.cumulus.models._
import io.cumulus.models.fs.{Directory, File, FsNode}
import io.cumulus.models.sharing.{FileSharingSecurity, Sharing, SharingSecurity}
import io.cumulus.models.user.User
import io.cumulus.models.user.session.UserSession
import io.cumulus.persistence.storage.StorageCipher
import io.cumulus.persistence.stores.{FsNodeStore, SharingStore, UserStore}

import scala.concurrent.Future

class SharingService(
  userStore: UserStore,
  fsNodeStore: FsNodeStore,
  sharingStore: SharingStore
)(
  implicit
  qb: QueryBuilder[CumulusDB]
) extends Logging {

  /** Generate a sharing for a given file; both for the file itself and for its thumbnail. */
  private def generateSharingSecurities(secretCode: ByteString, file: File)(implicit session: UserSession): Map[UUID, FileSharingSecurity] = {
    Seq(
      file.storageReference.cipher.map(c => file.storageReference.id -> generateSharingSecurity(secretCode, c)),
      file.thumbnailStorageReference.flatMap(thumbnail => thumbnail.cipher.map(c => thumbnail.id -> generateSharingSecurity(secretCode, c)))
    ).flatten.toMap
  }

  /** Generate a sharing for the privded storage cipher */
  private def generateSharingSecurity(secretCode: ByteString, storageCipher: StorageCipher)(implicit session: UserSession): FileSharingSecurity = {
    val filePrivateKey     = storageCipher.privateKey(session.security.privateKey(session.password))
    val filePrivateKeySalt = storageCipher.salt

    FileSharingSecurity.create(
      secretCode,
      filePrivateKey,
      filePrivateKeySalt
    )
  }

  /**
    * Shares a node.
    *
    * @param id The unique ID of the node to be shared.
    * @param expiration Optional date of expiration of the sharing.
    * @param session The session of the user performing the operation.
    */
  def shareNode(
    id: UUID,
    expiration: Option[Int] = None
  )(implicit session: UserSession): Future[Either[AppError, (FsNode, Sharing, String)]] = {
    val user = session.user

    for {
      // Get the node to share
      node <- QueryE.getOrNotFound(fsNodeStore.findAndLockByIdAndUser(id, user))

      // Generate a secret code. This secret key won't be kept on the server
      secretCode = Crypto.randomBytes(16)

      // Generate the sharing according to the type of node
      sharing <- QueryE.pure {
        node match {
          case file: File =>
            // Create the sharing
            Right(
              Sharing.create(
                expiration = expiration.map(LocalDateTime.now.plusSeconds(_)),
                owner = user.id,
                fsNode = node.id,
                security = SharingSecurity.create(secretCode),
                fileSecurity = generateSharingSecurities(secretCode, file)
              )
            )

          case _: Directory =>
            // TODO iterate through all the file...
            Left(AppError.validation("validation.sharing.invalid-type"))
          case _ =>
            Left(AppError.validation("validation.sharing.invalid-type"))
        }
      }

      // Save the sharing
      _ <- QueryE.lift(sharingStore.create(sharing))

    } yield (node, sharing, Base16.encode(secretCode))

  }.commit()

  /**
    * Lists all the sharings of an user.
    *
    * @param pagination The pagination of the results.
    * @param user The user performing the operation.
    */
  def listAllSharings(
    pagination: QueryPagination
  )(implicit user: User): Future[Either[AppError, PaginatedList[Sharing]]] =
    QueryE.lift(sharingStore.findByUser(user, pagination)).run()

  /**
    * Lists all the sharings of the node.
    *
    * @param id The unique ID of the node.
    * @param user The user performing the operation.
    */
  def listSharings(
    id: UUID,
    pagination: QueryPagination
  )(implicit user: User): Future[Either[AppError, PaginatedList[Sharing]]] = {

    for {
      // Find the node
      node <- QueryE.getOrNotFound(fsNodeStore.findByIdAndUser(id, user))

      // Find all the sharing of this node
      sharings <- QueryE.lift(sharingStore.findByNode(node, pagination))

    } yield sharings

  }.commit()

  /**
    * Finds a sharing.
    *
    * @param reference The reference of the sharing to search.
    * @param user The user performing the operation.
    */
  def findSharing(
    reference: String
  )(implicit user: User): Future[Either[AppError, Sharing]] = {

    for {
      // Get the sharing
      sharing <- QueryE.getOrNotFound(sharingStore.findByReference(reference))
      _           <- QueryE.pure(checkUserCredentials(sharing, user))
    } yield sharing

  }.commit()

  /**
    * Deletes a sharing.
    *
    * @param reference The reference of the sharing to delete.
    * @param user The user performing the operation.
    */
  def deleteSharing(
    reference: String
  )(implicit user: User): Future[Either[AppError, Unit]] = {

    for {
      // Get the sharing
      sharing <- QueryE.getOrNotFound(sharingStore.findAndLockBy(SharingStore.referenceField, reference))
      _       <- QueryE.pure(checkUserCredentials(sharing, user))

      // Delete it
      _ <- QueryE.lift(sharingStore.delete(sharing.id))

    } yield ()

  }.commit()

  /** Check if the current user have access to critical information for this sharing. */
  private def checkUserCredentials(sharing: Sharing, user: User) = {
    if(sharing.owner != user.id)
      Left(AppError.forbidden("validation.sharing.forbidden"))
    else
      Right(())
  }

  /**
    * Returns a shared directory. Will fail if the element is not a directory or not found.
    *
    * @see [[io.cumulus.services.SharingService#findSharedNode SharingService.findSharedNode]]
    */
  def findSharedDirectory(
    reference: String,
    path: Path,
    secretCode: String
  ): Future[Either[AppError, (Sharing, User, Directory)]] = {

    for {
      // Find the node
      result <- find(reference, path, secretCode)
      (sharing, user, node) = result

      // Check if the node is a directory
      directory <- QueryE.pure {
        node match {
          case directory: Directory =>
            Right(directory)
          case _ =>
            Left(AppError.validation("validation.fs-node.not-directory", path))
        }
      }
    } yield (sharing, user, directory)

  }.commit()

  /**
    * Returns a shared file. Will fail if the element is not a file or not found.
    *
    * @see [[io.cumulus.services.SharingService#findSharedNode SharingService.findSharedNode]]
    */
  def findSharedFile(
    reference: String,
    path: Path,
    secretCode: String
  ): Future[Either[AppError, (Sharing, User, File)]] = {

    for {
      // Find the node
      result <- find(reference, path, secretCode)
      (sharing, user, node) = result

      // Check if the node is a file
      file <- QueryE.pure {
        node match {
          case file: File =>
            Right(file)
          case _ =>
            Left(AppError.validation("validation.fs-node.not-file", path))
        }
      }
    } yield (sharing, user, file)

  }.commit()

  /**
    * Finds and returns a shared node.
    *
    * @param reference The reference of the shared node.
    * @param path The path of the element, relative to the shared node.
    * @param secretCode The secret code of the sharing.
    */
  def findSharedNode(
    reference: String,
    path: Path,
    secretCode: String
  ): Future[Either[AppError, (Sharing, User, FsNode)]] =
    find(reference, path, secretCode).commit()

  /**
    * Finds a shared node by its reference, relative path and secret code. For example, if the directory `/foo/bar`
    * is shared and the find method is call this sharing with the path `/fuzz`, then the element `/foo/bar/fuzz` will
    * be searched (and returned if found). The returned node will have a sanitized path relative to the shared node.
    *
    * @param reference The reference of the sharing.
    * @param path The path of the element contained. Use `/` to get the base shared element (directory or file).
    * @param secretCode The secret code of the sharing.
    */
  private def find(
    reference: String,
    path: Path,
    secretCode: String
  ): QueryE[CumulusDB, (Sharing, User, FsNode)] = {

    for {
      // Find the sharing used
      sharing <- QueryE.getOrNotFound(sharingStore.findBy(SharingStore.referenceField, reference))

      // Test the secret code
      _ <- QueryE.pure {
        Base16.decode(secretCode) match {
          case Some(code) if sharing.security.checkSecretCode(code) =>
            Right(())
          case _ =>
            Left(AppError.unauthorized("validation.sharing.invalid-key"))
        }
      }

      // Check the expiration date
      _ <- QueryE.pure {
        (sharing.expiration, LocalDateTime.now) match {
          case (Some(expiration), now) if expiration.isBefore(now) =>
            Left(AppError.validation("validation.sharing.expired"))
          case _ =>
            Right(())
        }
      }

      // Find the user
      sharingUser <- QueryE.get(userStore.find(sharing.owner))

      // Find the base node shared
      sharedNode <- QueryE.get(fsNodeStore.find(sharing.fsNode))

      // Find the element shared
      node <- {
        if(path.isRoot)
          QueryE.pure(sharedNode)
        else {
          val realPath: Path = sharedNode.path ++ path
          QueryE.getOrNotFound(fsNodeStore.findByPathAndUser(realPath, sharingUser))
        }
      }

      // Do not expose the real path
      sanitizedNode = node.moved(path.relativeTo(sharedNode.path))

    } yield (sharing, sharingUser, sanitizedNode)

  }

}
