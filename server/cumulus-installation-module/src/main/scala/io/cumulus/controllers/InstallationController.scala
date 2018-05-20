package io.cumulus.controllers

import akka.actor.Scheduler
import io.cumulus.controllers.payloads.AdminCreationPayload
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.core.utils.ServerWatchdog
import io.cumulus.models.configuration.{ConfigurationEntries, DatabaseConfiguration, EmailConfiguration}
import io.cumulus.models.user.User
import io.cumulus.persistence.services.ConfigurationService
import io.cumulus.views.CumulusInstallationPage
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.postfixOps

/**
  * Controller used during the installation, allowing to test, read and update the configuration. Note that this
  * controller does not use any authentication (because the database is not even set), and should only be used
  * during the installation along with the installation server.
  */
class InstallationController(
  configurationService: ConfigurationService,
  cc: ControllerComponents,
  watchdog: ServerWatchdog,
  scheduler: Scheduler
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with BodyParserJson {

  def index = Action { implicit request =>
    Ok(CumulusInstallationPage())
  }

  /**
    * Reload programmatically the server. This will stop then restart the server, reloading everything on the server.
    * During the reload the server won't be able to respond to queries.
    */
  def reload = Action { implicit request =>
    ApiResponse {
      logger.info("Requesting the reloading of the Cumulus server")

      akka.pattern.after(2 seconds, scheduler)(Future {
        watchdog.reload()
      })

      Right(Json.obj("message" -> request2Messages(request)("api-action.reload")))
    }
  }

  /**
    * Returns the database configuration.
    */
  def getDatabaseConfiguration: Action[AnyContent] =
    Action.async { implicit request =>
      ApiResponse {
        configurationService.getDatabaseConfiguration.map(Right(_))
      }
    }

  /**
    * Tests the provided database configuration. Bad configurations will not return a 400 error, but a detail on how
    * the test failed (with the message of the error).
    */
  def testDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
        val databaseConfiguration = request.body

        configurationService.testDatabaseConfiguration(databaseConfiguration).map(Right(_))
      }
    }

  /**
    * Applies the provided database configuration to the override configuration file, to be used when the server is
    * next reloaded.
    */
  def configureDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
        val databaseConfiguration = request.body

        configurationService.updateConfiguration(databaseConfiguration)
      }
    }

  /**
    * Returns the SMTP configuration.
    */
  def getEmailConfiguration: Action[AnyContent] =
    Action.async { implicit request =>
      ApiResponse {
        configurationService.getEmailConfiguration.map(Right(_))
      }
    }

  /**
    * Test the SMTP configuration. Bad configurations will not return a 400 error, but a detail on how the test failed
    * (with the message of the error). Note that even if the mail is correctly sent, the user still needs to manually
    * check that the mail have been correctly delivered.
    */
  def testEmail: Action[EmailConfiguration] =
    Action.async(parseJson[EmailConfiguration]) { implicit request =>
      ApiResponse {
        val emailConfiguration = request.body

        configurationService.testEmailConfiguration(emailConfiguration).map(Right(_))
      }
    }

  /**
    * Applies the provided email configuration to the override configuration file, to be used when the server is
    * next reloaded.
    */
  def configureEmail: Action[EmailConfiguration] =
    Action.async(parseJson[EmailConfiguration]) { implicit request =>
      ApiResponse {
        val emailConfiguration = request.body

        configurationService.updateConfiguration(emailConfiguration)
      }
    }

  // TODO get administrator
  // TODO update administrator ?

  /**
    * Create a new administrator.
    */
  def createAdministrator: Action[AdminCreationPayload] =
    Action.async(parseJson[AdminCreationPayload]) { implicit request =>
      ApiResponse {
        val adminPayload = request.body
        val admin = User.createAdministrator(adminPayload.email, adminPayload.login, adminPayload.password)

        // TODO should ask to validate the email

        configurationService.createAdministrator(admin)
      }
    }

  /**
    * Create a new administrator.
    */
  def validateInstallation: Action[AnyContent] =
    Action.async { implicit request =>
      ApiResponse {
        // TODO check the database and that an admin is created, and that his email is validated
        // TODO and then restart the server which should launch normally

        // Deactivate the installation
        configurationService.updateConfiguration(
          new ConfigurationEntries {
            def toPlayConfiguration: Configuration =
              Configuration(
                "cumulus.management.installation" -> false
              )
          }
        )
      }
    }

}
