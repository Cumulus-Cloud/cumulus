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

  // TODO doc
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

  // TODO doc
  def deleteSharing(
    reference: String
  )(implicit user: User): Future[Either[AppError, Unit]] = {

    for {
      // Get the sharing
      sharing <- QueryE.getOrNotFound(sharingStore.findAndLockBy(SharingStore.referenceField, reference))

      _ <- QueryE.pure {
        if(sharing.owner != user.id)
          Left(AppError.forbidden("")) // TODO
        else
          Right(())
      }

      // Delete it
      _ <- QueryE.lift(sharingStore.delete(sharing.id))

    } yield ()

  }.commit()

  // TODO doc
  def findSharedDirectory(
    reference: String,
    path: Path,
    secretCode: String
  ): Future[Either[AppError, (Sharing, Directory)]] = {

    for {
      // Find the node
      result <- find(reference, path, secretCode)
      (sharing, node) = result

      // Check if the node is a directory
      directory <- QueryE.pure {
        node match {
          case directory: Directory =>
            Right(directory)
          case _ =>
            Left(AppError.validation("validation.fs-node.not-directory", path))
        }
      }
    } yield (sharing, directory)

  }.commit()

  // TODO doc
  def findSharedFile(
    reference: String,
    path: Path,
    secretCode: String
  ): Future[Either[AppError, (Sharing, File)]] = {

    for {
      // Find the node
      result <- find(reference, path, secretCode)
      (sharing, node) = result

      // Check if the node is a directory
      file <- QueryE.pure {
        node match {
          case file: File =>
            Right(file)
          case _ =>
            Left(AppError.validation("validation.fs-node.not-file", path))
        }
      }
    } yield (sharing, file)

  }.commit()

  // TODO doc
  def findSharedNode(
    reference: String,
    path: Path,
    secretCode: String
  ): Future[Either[AppError, (Sharing, FsNode)]] =
    find(reference, path, secretCode).commit()

  // TODO doc
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
            Left(AppError.validation("validation.sharing.expired")) // TODO
          case _ =>
            Right(())
        }
      }

      // Find the user
      sharingUser <- QueryE.shouldBeFound(userStore.find(sharing.owner))

      // Find the base node shared
      sharedNode <- QueryE.shouldBeFound(fsNodeStore.find(sharing.fsNode))

      // Find the element shared
      node <- {
        if(path.isRoot)
          QueryE.pure(sharedNode)
        else {
          val realPath: Path = sharedNode.path + "/" + path
          QueryE.getOrNotFound(fsNodeStore.findByPathAndUser(realPath, sharingUser))
        }
      }

    } yield (sharing, node)

  }

}
