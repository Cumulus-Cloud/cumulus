package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import play.api.db._
import play.api.inject.{ApplicationLifecycle, DefaultApplicationLifecycle}
import play.api.libs.json.{Format, Json}
import play.api.mvc.{AbstractController, Action, ControllerComponents}
import play.api.{Configuration, Environment}

class InstallationController(
  environment: Environment,
  configuration: Configuration,
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with BodyParserJson {

  trait ConfigurationEntries {

    def toPlayConfiguration: Configuration

  }

  case class DatabaseConfiguration(
    username: String,
    password: String,
    hostname: String,
    database: String,
    port: Option[String]
  ) extends ConfigurationEntries {

    def toPlayConfiguration: Configuration =
      Configuration(
        DatabaseConfiguration.usernameKey -> username,
        DatabaseConfiguration.passwordKey -> password,
        DatabaseConfiguration.urlKey -> s"jdbc:postgresql://$hostname:${port.getOrElse("5432")}/$database"
      )

  }

  object DatabaseConfiguration {

    private val usernameKey = "db.default.username"
    private val passwordKey = "db.default.password"
    private val urlKey      = "db.default.url"

    implicit val format: Format[DatabaseConfiguration] =
      Json.format[DatabaseConfiguration]

  }

  def testDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
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

  def configureDatabase = Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
    // TODO
    ???
  }

}
