package io.cumulus.persistence.services

import java.io.File

import akka.stream.{IOResult, Materializer}
import com.typesafe.config.ConfigFactory
import io.cumulus.core.Settings
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.core.utils.ConfigurationWriter
import io.cumulus.core.validation.AppError
import io.cumulus.models.configuration.utils.{TestFailed, TestResult, TestSuccessful}
import io.cumulus.models.configuration.{ConfigurationEntries, DatabaseConfiguration, EmailConfiguration}
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.{FsNodeStore, UserStore}
import io.cumulus.services.{MailService, UserService}
import play.api.db._
import play.api.i18n.Messages
import play.api.inject.{ApplicationLifecycle, DefaultApplicationLifecycle}
import play.api.libs.mailer.{Email, SMTPConfigurationProvider, SMTPMailer}
import play.api.{Configuration, Environment}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

class ConfigurationService(
  environment: Environment
)(
  implicit configuration: Configuration,
  materializer: Materializer,
  settings: Settings,
  ec: ExecutionContext
) {

  /**
    * Updates the server configuration with the provided information.
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
    * Read the database configuration from the override file.
    */
  def getDatabaseConfiguration: Future[DatabaseConfiguration] = Future {
    DatabaseConfiguration.fromPlayConfiguration(configurationFile)
  }

  /**
    * Tests the provided database configuration by trying to connect to the database. If any error occurs, the test
    * will be a failure, otherwise the test is a success.
    * @param databaseConfiguration The database configuration to test.
    */
  def testDatabaseConfiguration(
    databaseConfiguration: DatabaseConfiguration
  ): Future[TestResult] = {
    withDatabase(
      _     => Future.successful(TestSuccessful),
      error => TestFailed(error),
      databaseConfiguration.toPlayConfiguration
    )
  }

  /**
    * Read the SMTP configuration from the override file.
    */
  def getEmailConfiguration: Future[EmailConfiguration] = Future {
    EmailConfiguration.fromPlayConfiguration(configurationFile)
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
            "Cumulus Cloud - Configuration test",
            emailConfiguration.from,
            Seq(emailConfiguration.user.getOrElse("")),
            Some("Test OK") // TODO use mail template + mail service
          )
        )
    } match {
      case Failure(error) =>
        TestFailed(error.getMessage)
      case Success(_) =>
        TestSuccessful
    }
  }

  /**
    * Create an administrator using the provided information
    * @param admin The new administrator
    */
  def createAdministrator(admin: User)(implicit messages: Messages): Future[Either[AppError, User]] = {
    val combinedConfig = configuration ++ configurationFile

    withDatabase({ db =>
      val qb = new QueryBuilder[CumulusDB](db, ec)
      val userStore = new UserStore()(qb)
      val fsNodeStore = new FsNodeStore()(qb)
      val mailService = new MailService(new SMTPMailer(new SMTPConfigurationProvider(combinedConfig.underlying).get()))
      val userService = new UserService(userStore, fsNodeStore, mailService)(settings, qb)

      userService.createUser(admin)
    }, { error =>
      Left(AppError.technical("Database not configured", error)) // TODO error message
    }, combinedConfig)
  }

  /**
    * Get the configuration from the override configuration file. Note that this is not the whole configuration
    * of the server, and may lack information from the main configuration. Also note that information present in
    * this configuration may already be present in the main configuration if the server have been reloaded.
    */
  private def configurationFile: Configuration = {
    Configuration(ConfigFactory.parseFileAnySyntax(new File(settings.configuration.path)))
  }

  /**
    * Helper to use the database during the installation. This helper allow to start the database, handle any error
    * during or after the operation, and then close the database.
    */
  private def withDatabase[R](
    f: CumulusDB    => Future[R],
    onError: String => R,
    overrideConfig: Configuration = Configuration.empty
  ): Future[R] = {
    // Create a fake application, with a fake lifecycle, to test the database's connection
    val fakeApplicationLifecycle: ApplicationLifecycle = new DefaultApplicationLifecycle()

    Try {
      val connectionPool: ConnectionPool =
        new HikariCPConnectionPool(environment)

      val dbApi: DBApi =
        new DBApiProvider(
          environment,
          configuration ++ overrideConfig,
          connectionPool,
          fakeApplicationLifecycle,
          None
        ).get

      val database: Database =
        dbApi.database("default")

      database
        .getConnection()

      f(CumulusDB(database))

    } match {
      case Failure(error) =>
        def getAllSources(e: Throwable): Seq[Throwable] = {
          Seq(e) ++ Option(e.getCause).map(cause => getAllSources(cause)).getOrElse(Seq.empty)
        }

        val causeError = getAllSources(error).take(3).reverse.headOption.getOrElse(error)
        val response = onError(causeError.getMessage)

        fakeApplicationLifecycle.stop().map(_ => response).recover { case _: Exception => response }
      case Success(futureResult) =>
        futureResult.flatMap(result => fakeApplicationLifecycle.stop().map(_ =>  result))
    }
  }

}
