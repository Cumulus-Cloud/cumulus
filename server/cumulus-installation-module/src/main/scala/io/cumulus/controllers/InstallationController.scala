package io.cumulus.controllers

import io.cumulus.controllers.payloads.AdminCreationPayload

import scala.concurrent.ExecutionContext
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.configuration.{DatabaseConfiguration, EmailConfiguration}
import io.cumulus.models.user.User
import io.cumulus.persistence.services.ConfigurationService
import io.cumulus.persistence.stores.UserStore
import io.cumulus.services.UserService
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

/**
  * Controller used during the installation, allowing to test, read and update the configuration. Note that this
  * controller does not use any authentication (because the database is not even set), and should only be used
  * during the installation along with the installation server.
  */
class InstallationController(
  configurationService: ConfigurationService,
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with BodyParserJson {

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

        // TODO should ask to validate the email

        configurationService.updateConfiguration(emailConfiguration)
      }
    }

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
        // TODO should ask to validate the email

        configurationService.createAdministrator(admin)
      }
    }

}
