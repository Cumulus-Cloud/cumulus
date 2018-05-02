package io.cumulus.controllers

import java.io.File
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

import akka.stream.IOResult
import com.typesafe.config.ConfigFactory
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.utils.ConfigurationWriter
import io.cumulus.core.validation.AppError
import io.cumulus.models.configuration.DatabaseConfiguration
import play.api.db._
import play.api.inject.{ApplicationLifecycle, DefaultApplicationLifecycle}
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}
import play.api.{Configuration, Environment}

class InstallationController(
  environment: Environment,
  configuration: Configuration,
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with BodyParserJson {

  def testDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
        // TODO move all that into an utils class
        val databaseConfiguration = request.body
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
            val response = Right(Json.obj("success" -> false, "error" -> causeError.getMessage))

            fakeApplicationLifecycle.stop().map(_ => response).recover { case _: Exception => response }
          case Success(_) =>
            fakeApplicationLifecycle.stop().map { _ =>
              Right(Json.obj("success" -> true))
            }
        }
      }
    }

  def configureDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
        val databaseConfiguration = request.body

        // Try to read the existing configuration file
        val configurationFile = new File("conf/override.conf") // TODO store somewhere
        val configuration     = Configuration(ConfigFactory.parseFileAnySyntax(configurationFile))

        Try {
          // Write to the destination
          configurationFile.getParentFile.mkdirs
          ConfigurationWriter(configuration ++ databaseConfiguration.toPlayConfiguration).write(configurationFile)
        } match {
          case Failure(error) =>
            Future.successful(Left(AppError.technical("installation.configuration-file-creation-failed", error.getMessage)))
          case Success(future) =>
            future.map {
              case IOResult(_, Success(_)) =>
                Right(Json.obj("success" -> true))
              case IOResult(_, Failure(error)) =>
                Left(AppError.technical("installation.configuration-file-creation-failed", error.getMessage))
            }
        }
      }
    }

}
