package io.cumulus.persistence.storage

import java.io.{InputStream, OutputStream}
import java.util.UUID

import io.cumulus.core.validation.AppError
import play.api.Configuration

import scala.concurrent.{ExecutionContext, Future}

trait StorageEngine {

  def version: String
  def name: String
  def reference: String

  def deleteObject(id: UUID)(implicit e: ExecutionContext): Future[Either[AppError, Unit]]

  def writeObject(id: UUID)(implicit e: ExecutionContext): OutputStream

  def readObject(id: UUID)(implicit e: ExecutionContext): InputStream

  def listObjects(implicit e: ExecutionContext): Future[Seq[UUID]]

}

trait StorageEngineFactory {

  def name: String
  def version: String

  def create(reference: String, configuration: Configuration): StorageEngine

}

case class StorageEngines(default: StorageEngine, engines: Seq[StorageEngine]) {

  def get(reference: String): Either[AppError, StorageEngine] =
    engines
      .find(_.reference.toUpperCase == reference.toUpperCase)
      .map(Right.apply)
      .getOrElse(Left(AppError.validation("validation.fs-node.unknown-storage-engine", reference)))

}

object StorageEngines {

  val confKey = "cumulus.storageEngines"
  val defaultKey = "default"
  val ignoredKeys = Seq(defaultKey, "replicate")

  /** Initialize the storage engines using the configuration */
  def apply(
    storageEngineFactories: Seq[StorageEngineFactory]
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
