package io.cumulus.persistence.services

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

import io.cumulus.models.configuration.DatabaseConfiguration
import io.cumulus.models.configuration.utils.{TestFailed, TestResult, TestSuccessful}
import play.api.db._
import play.api.inject.{ApplicationLifecycle, DefaultApplicationLifecycle}
import play.api.{Configuration, Environment}

class ConfigurationService(
  environment: Environment
)(
  implicit configuration: Configuration
) {

  def testDatabase(
    databaseConfiguration: DatabaseConfiguration
  ): Future[TestResult] = {
    // Create a fake application, with a fake lifecycle, to test the database's connection
    val fakeApplicationLifecycle: ApplicationLifecycle = new DefaultApplicationLifecycle()

    Try {
      val connectionPool: ConnectionPool =
        new HikariCPConnectionPool(environment)

      val dbApi: DBApi =
        new DBApiProvider(
          environment,
          configuration ++ databaseConfiguration.toPlayConfiguration,
          connectionPool,
          fakeApplicationLifecycle,
          None
        ).get

      val database: Database =
        dbApi.database("default")

      database
        .getConnection()
        .close()

    } match {
      case Failure(error) =>
        def getAllSources(e: Throwable): Seq[Throwable] = {
          Seq(e) ++ Option(e.getCause).map(cause => getAllSources(cause)).getOrElse(Seq.empty)
        }

        val causeError = getAllSources(error).take(3).reverse.headOption.getOrElse(error)
        val response = TestFailed(causeError.getMessage)

        fakeApplicationLifecycle.stop().map(_ => response).recover { case _: Exception => response }
      case Success(_) =>
        fakeApplicationLifecycle.stop().map(_ =>  TestSuccessful)
    }
  }


}
