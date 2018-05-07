package io.cumulus.persistence.services

import java.io.File
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

import akka.stream.IOResult
import com.typesafe.config.ConfigFactory
import io.cumulus.core.Settings
import io.cumulus.core.utils.ConfigurationWriter
import io.cumulus.core.validation.AppError
import io.cumulus.models.configuration.utils.{TestFailed, TestResult, TestSuccessful}
import io.cumulus.models.configuration.{ConfigurationEntries, DatabaseConfiguration, EmailConfiguration}
import play.api.db._
import play.api.inject.{ApplicationLifecycle, DefaultApplicationLifecycle}
import play.api.libs.mailer.{Email, SMTPConfigurationProvider, SMTPMailer}
import play.api.{Configuration, Environment}

class ConfigurationService(
  environment: Environment
)(
  implicit configuration: Configuration,
  settings: Settings
) {

  /**
    * Updates the user's configuration.
    * @param newConfiguration The configuration update.
    */
  def updateConfiguration(newConfiguration: ConfigurationEntries): Future[Either[AppError, Unit]] = {
    // Try to read the existing configuration file
    val configurationFile = new File(settings.configuration.path)
    val configuration     = Configuration(ConfigFactory.parseFileAnySyntax(configurationFile))

    Try {
      // Write to the destination
      configurationFile.getParentFile.mkdirs
      ConfigurationWriter(configuration ++ newConfiguration.toPlayConfiguration).write(configurationFile)
    } match {
      case Failure(error) =>
        Future.successful(Left(AppError.technical("installation.configuration-file-creation-failed", error.getMessage)))
      case Success(future) =>
        future.map {
          case IOResult(_, Success(_)) =>
            Right(())
          case IOResult(_, Failure(error)) =>
            Left(AppError.technical("installation.configuration-file-creation-failed", error.getMessage))
        }
    }
  }

  /**
    * Tests the provided database configuration by trying to connect to the database. If any error occurs, the test
    * will be a failure, otherwise the test is a success.
    * @param databaseConfiguration The database configuration to test.
    */
  def testDatabaseConfiguration(
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

  /**
    * Tests the SMTP configuration by trying to connect to send an email. If any error occurs, the test will be a
    * failure, otherwise the test is a success and a mail will be send.
    * @param emailConfiguration The SMTP configuration to test.
    */
  def testEmailConfiguration(
    emailConfiguration: EmailConfiguration
  ): Future[TestResult] = Future {

    val config = (configuration ++ emailConfiguration.toPlayConfiguration).underlying

    Try {
      val mailerClient: SMTPMailer = new SMTPMailer(new SMTPConfigurationProvider(config).get())
      mailerClient
        .send(
          Email(
            "Configuration test",
            emailConfiguration.user.getOrElse(""),
            Seq(emailConfiguration.user.getOrElse("")),
            Some("Test OK")
          )
        )
    } match {
      case Failure(error) =>
        TestFailed(error.getMessage)
      case Success(_) =>
        TestSuccessful
    }
  }


}
