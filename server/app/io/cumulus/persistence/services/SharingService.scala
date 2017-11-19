package io.cumulus.persistence.services

import java.time.LocalDateTime
import scala.concurrent.Future

import io.cumulus.core.Logging
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{QueryBuilder, QueryE}
import io.cumulus.core.utils.{Base64, Crypto}
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.{Directory, File, FsNode}
import io.cumulus.models.{Path, Sharing, User}
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
    expiration: Option[Int] = None,
    password: Option[String] = None,
    needAuth: Boolean = false
  )(implicit user: User): Future[Either[AppError, Sharing]] = {

    for {
      // Get the node to share
      node <- QueryE.getOrNotFound(fsNodeStore.findAndLockByPathAndUser(path, user))

      // Create the sharing
      sharing = Sharing(
        password,
        expiration.map(LocalDateTime.now.plusSeconds(_)),
        needAuth,
        user.id,
        node.id
      )

      // Save the sharing
      _ <- QueryE.lift(sharingStore.create(sharing))

    } yield sharing

  }.commit()

  // TODO doc
  def deleteSharing(
    code: String
  )(implicit user: User): Future[Either[AppError, Sharing]] = {

    for {
      // Get the sharing
      sharing <- QueryE.getOrNotFound(sharingStore.findAndLockBy(SharingStore.codeField, code))

      _ <- QueryE.pure {
        if(sharing.owner != user.id)
          Left(AppError.forbidden("")) // TOOD
        else
          Right(())
      }

      // Delete it
      _ <- QueryE.lift(sharingStore.delete(sharing.id))

    } yield sharing

  }.commit()

  // TODO doc
  def findSharedDirectory(
    code: String,
    path: Path,
    password: Option[String],
    user: Option[User]
  ): Future[Either[AppError, Directory]] = {

    for {
      // Find the node
      node <- find(code, path, password, user)

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

  // TODO doc
  def findSharedFile(
    code: String,
    path: Path,
    password: Option[String],
    user: Option[User]
  ): Future[Either[AppError, File]] = {

    for {
      // Find the node
      node <- find(code, path, password, user)

      // Check if the node is a directory
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

  // TODO doc
  def findSharedNode(
    code: String,
    path: Path,
    password: Option[String],
    user: Option[User]
  ): Future[Either[AppError, FsNode]] =
    find(code, path, password, user).commit()

  // TODO doc
  private def find(
    code: String,
    path: Path,
    password: Option[String],
    user: Option[User]
  ) = {

    for {
      // Find the sharing used
      sharing <- QueryE.getOrNotFound(sharingStore.findBy(SharingStore.codeField, code))

      // Check if auth is required
      _ <- QueryE.pure {
        if(sharing.needAuth && user.isEmpty)
          Left(AppError.forbidden("Authentication required")) // TODO
        else
          Right(())
      }

      // Check the password, if defined
      _ <- QueryE.pure {
        (sharing.password, password) match {
          case (Some(_), None) =>
            Left(AppError.validation("Password required")) // TODO
          case (Some(hashed), Some(pass)) =>
            if(Base64.encode(Crypto.hashSHA256(pass)) == hashed)
              Right(())
            else
              Left(AppError.validation("Wrong password")) // TODO
          case (None, _) =>
            Right(())
        }
      }

      // Check the expiration date
      _ <- QueryE.pure {
        (sharing.expiration, LocalDateTime.now) match {
          case (Some(expiration), now) if expiration.isBefore(now) =>
            Left(AppError.validation("Sharing expired")) // TODO
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

    } yield node

  }

}
