package io.cumulus.persistence.storage

import java.io.{InputStream, OutputStream}
import java.util.UUID

import io.cumulus.Configuration
import io.cumulus.validation.AppError

import scala.concurrent.{ExecutionContext, Future}
import io.cumulus.stream.storage.StorageReferenceReader.logger

/**
  * Storage engine, used to write and read objects.
  */
trait StorageEngine {

  /** Version of the engine */
  def version: String
  /** Name of the engine */
  def name: String
  /** Specific reference of the engine. Should be unique. */
  def reference: String

  /**
    * Deletes an object by its ID.
    * @param id ID of the object to delete.
    */
  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Either[AppError, Unit]]

  /**
    * Creates an object for the specified UUID, and return a stream to write to that object.
    * @param id ID of the object to create.
    * @return An `OutputStream` to that object.
    */
  def writeObject(id: UUID)(implicit e: ExecutionContext): OutputStream

  /**
    * Reads an object for the specified UUID, and return a stream to read that object's content.
    * @param id ID of the object to read.
    * @return An `InputStream` from that object.
    */
  def readObject(id: UUID)(implicit e: ExecutionContext): InputStream

}

/**
  * Engine factory to create an engine according to a specific configuration.
  */
trait StorageEngineFactory {

  def name: String
  def version: String

  /**
    * Creates a storage engine.
    * @param reference The unique reference of the new engine.
    * @param configuration The configuration for that engine.
    */
  def create(reference: String, configuration: Configuration): StorageEngine

}

/**
  * List of available storage engine with helpers to get a storage engine by its reference or any storage object.
  */
case class StorageEngines(default: StorageEngine, engines: Seq[StorageEngine]) {

  /**
    * Returns a storage engine by its reference (unique name). Will return an error if the reference doesn't refer to
    * an existing storage engine.
    * @param reference The reference to look for.
    */
  def get(reference: String): Either[AppError, StorageEngine] =
    engines
      .find(_.reference.toUpperCase == reference.toUpperCase)
      .map(Right.apply)
      .getOrElse(Left(AppError.validation("validation.fs-node.unknown-storage-engine", reference)))

  /**
    * Returns a storage engine by its reference, using the provided storage object. Will return an error if the
    * reference doesn't refer to an existing storage engine. Will also log any incoherence between the expected
    * storage engine and the one found.
    *
    * @param storageObject The storage object used to retrieve the storage engine.
    */
  def get(storageObject: StorageObject): Either[AppError, StorageEngine] =
    get(storageObject.storageEngineReference)
    .map { storageEngine =>
      // Log any incoherence
      if(storageEngine.version != storageObject.storageEngineVersion)
        logger.warn(s"Using the storage engine ${storageObject.storageEngineVersion} (${storageEngine.reference}) with version ${storageEngine.version} instead of version ${storageObject.storageEngineVersion}")
      if(storageEngine.name != storageObject.storageEngine)
        logger.warn(s"Using the storage engine ${storageEngine.name} instead of ${storageObject.storageEngine}")

      storageEngine
    }

  /**
    * Returns a storage engine by its reference, using the provided storage reference. Will return an error if the
    * first reference doesn't refer to an existing storage engine, or if no reference are provided. Will also log any
    * incoherence between the expected storage engine and the one found.
    * <br/><br/>
    * Note: Temporary, for now we guess the storage engine to use base on the first storage reference ; this can only
    * works because we only use an unique storage reference with a file (no replication yet!)
    *
    * @param storageReference The storage reference used to retrieve the storage engine.
    */
  def get(storageReference: StorageReference): Either[AppError, StorageEngine] =
    storageReference
      .storage
      .headOption
      .toRight(AppError.validation("validation.fs-node.no-storage-reference"))
      .flatMap(storageObject => get(storageObject))

}

object StorageEngines {

  val confKey = "cumulus.storageEngines"
  val defaultKey = "default"
  val ignoredKeys = Seq(defaultKey, "replicate")

  /** Initializes the storage engines using the configuration. */
  def apply(
    storageEngineFactories: StorageEngineFactory*
  )(implicit configuration: Configuration): StorageEngines = {

    val storageEnginesConf =
      configuration.get[Configuration](confKey)

    val engines =
      storageEnginesConf
        .subKeys
        .filter(!ignoredKeys.contains(_))
        .map { key =>

          val conf = configuration.get[Configuration](s"$confKey.$key")

          val storageType    = conf.get[String]("type")
          val storageVersion = conf.get[String]("version")

          storageEngineFactories
            .find(engine => engine.name == storageType && engine.version == storageVersion)
            .map(_.create(key, conf))
            .getOrElse(throw new Exception(s"Invalid storage engine name $storageType and/or version $storageVersion"))
        }
        .toList

    // Extract the default storage engine
    val defaultReference = storageEnginesConf.get[String](defaultKey)
    val defaultEngine =
      engines
        .find(_.reference == defaultReference)
        .getOrElse(throw new Exception(s"Invalid default storage engine $defaultReference"))

    // Construct the final element
    StorageEngines(defaultEngine, engines)

  }

}
