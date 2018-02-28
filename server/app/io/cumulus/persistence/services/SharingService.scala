package io.cumulus.persistence.services

import java.time.LocalDateTime
import scala.concurrent.Future

import io.cumulus.core.Logging
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE}
import io.cumulus.core.utils.Crypto._
import io.cumulus.core.utils.{Base16, Crypto}
import io.cumulus.core.validation.AppError
import io.cumulus.models._
import io.cumulus.models.fs.{Directory, File, FsNode}
import io.cumulus.persistence.stores.{FsNodeStore, SharingStore, UserStore}

class SharingService(
  userStore: UserStore,
  fsNodeStore: FsNodeStore,
  sharingStore: SharingStore
)(
  implicit
  qb: QueryBuilder[CumulusDB]
) extends Logging {

  /**
    * Share a node.
    *
    * @param path The path of the node to be shared
    * @param password The password of the user performing the sharing
    * @param expiration Optional date of expiration of the sharing
    * @param user The user performing the operation
    */
  def shareNode(
    path: Path,
    password: String,
    expiration: Option[Int] = None
  )(implicit user: User): Future[Either[AppError, (Sharing, String)]] = {

    for {
      // Get the node to share
      node <- QueryE.getOrNotFound(fsNodeStore.findAndLockByPathAndUser(path, user))

      // We need the private key
      (privateKey, salt) = (user.security.privateKey(password), user.security.privateKeySalt)

      // Generate a secret code
      secretCode = Crypto.randomBytes(16)

      // Create the sharing
      sharing = Sharing(
        expiration.map(LocalDateTime.now.plusSeconds(_)),
        user.id,
        node.id,
        privateKey,
        salt,
        secretCode
      )

      // Save the sharing
      _ <- QueryE.lift(sharingStore.create(sharing))

    } yield (sharing, Base16.encode(secretCode))

  }.commit()

  /**
    * List of the sharings of the node.
    *
    * @param path The path of the node
    * @param user The user performing the operation
    */
  def list(path: Path)(implicit user: User): Future[Either[AppError, Seq[Sharing]]] = {

    for {
      // Find the node
      node <- QueryE.getOrNotFound(fsNodeStore.findByPathAndUser(path, user))

      // Find all the sharing of this node
      sharings <- QueryE.lift(sharingStore.findByNode(node))

    } yield sharings

  }.commit()

  /**
    * Delete a sharing.
    *
    * @param reference The reference of the sharing to delete
    * @param user The user performing the operation
    */
  def deleteSharing(
    reference: String
  )(implicit user: User): Future[Either[AppError, Unit]] = {

    for {
      // Get the sharing
      sharing <- QueryE.getOrNotFound(sharingStore.findAndLockBy(SharingStore.referenceField, reference))

      _ <- QueryE.pure {
        if(sharing.owner != user.id)
          Left(AppError.forbidden("validation.sharing.forbidden"))
        else
          Right(())
      }

      // Delete it
      _ <- QueryE.lift(sharingStore.delete(sharing.id))

    } yield ()

  }.commit()


  /**
    * Returns a shared directory. Will fail if the element is not a directory or not found.
    *
    * @see [[io.cumulus.persistence.services.SharingService#findSharedNode SharingService.findSharedNode]]
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
    * @see [[io.cumulus.persistence.services.SharingService#findSharedNode SharingService.findSharedNode]]
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
    * @param reference The reference of the shared node
    * @param path The path of the element, relative to the shared node
    * @param secretCode The secret code of the sharing
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
    * @param reference The reference of the sharing
    * @param path The path of the element contained. Use `/` to get the base shared element (directory or file)
    * @param secretCode The secret code of the sharing
    */
  private def find(
    reference: String,
    path: Path,
    secretCode: String
  ) = {

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
