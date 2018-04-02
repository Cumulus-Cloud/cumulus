package io.cumulus.persistence.storage

import scala.concurrent.{ExecutionContext, Future}

import akka.actor.{Actor, ActorLogging, Props}
import cats.data.EitherT
import cats.implicits._
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.File

class ChunkRemover(
  storageEngines: StorageEngines
)(
  implicit ec: ExecutionContext
) extends Actor with ActorLogging {
  override def preStart(): Unit =
    log.info("Starting the ChunkRemover actor..")

  override def postStop(): Unit =
    log.info("Stopping the ChunkRemover actor..")

  override def receive: Receive = {
    case storageObject: StorageObject =>
      log.info(s"Deleting storage object ${storageObject.id}")
      deleteStorageObject(storageObject)
      ()
    case storageReference: StorageReference =>
      log.info(s"Deleting storage reference ${storageReference.id}")
      deleteStorageReference(storageReference)
      ()
    case file: File =>
      log.info(s"Deleting file ${file.id} with name ${file.name} for user ${file.owner}")
      deleteStorageReference(file.storageReference)
      ()
  }

  private def deleteStorageReference(storageReference: StorageReference) = {

    for {
      storageEngine <- EitherT.fromEither[Future](storageEngines.get(storageReference))
      result        <- EitherT[Future, AppError, Unit] {
        Future.sequence(
          storageReference
            .storage
            .map { storageObject =>
              storageEngine.deleteObject(storageObject.id).map { r =>
                r.left.map { error =>
                  // Log errors
                  log.warning(s"Error occurred during deletion of ${storageObject.id}: $error")
                  error
                }
              }
            }
        ).map(_ => Right({})) // Ignore results
      }
    } yield result

  }.value

  private def deleteStorageObject(storageObject: StorageObject) = {

    for {
      storageEngine <- EitherT.fromEither[Future](storageEngines.get(storageObject))
      result        <- EitherT(storageEngine.deleteObject(storageObject.id)).leftMap {
        error =>
          // Log errors
          log.warning(s"Error occurred during deletion of ${storageObject.id}: $error")
          error
      }
    } yield result

  }.value

}

object ChunkRemover {

  def props(
    storageEngines: StorageEngines
  )(implicit ec: ExecutionContext): Props =
    Props(new ChunkRemover(storageEngines))

}
