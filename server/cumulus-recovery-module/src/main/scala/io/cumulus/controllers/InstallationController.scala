package io.cumulus.controllers

import scala.concurrent.ExecutionContext

import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.configuration.{DatabaseConfiguration, EmailConfiguration}
import io.cumulus.persistence.services.ConfigurationService
import play.api.mvc.{AbstractController, Action, ControllerComponents}
import play.api.{Configuration, Environment}

class InstallationController(
  configurationService: ConfigurationService,
  environment: Environment,
  configuration: Configuration,
  settings: Settings,
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with ApiUtils with BodyParserJson {

  def getDatabaseConfiguration = ??? // TODO

  def testDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
        val databaseConfiguration = request.body

        configurationService.testDatabaseConfiguration(databaseConfiguration).map(Right(_))
      }
    }

  def configureDatabase: Action[DatabaseConfiguration] =
    Action.async(parseJson[DatabaseConfiguration]) { implicit request =>
      ApiResponse {
        val databaseConfiguration = request.body

        configurationService.updateConfiguration(databaseConfiguration)
      }
    }
  def getEmailConfiguration = ??? // TODO

  def testEmail: Action[EmailConfiguration] =
    Action.async(parseJson[EmailConfiguration]) { implicit request =>
      ApiResponse {
        val emailConfiguration = request.body

        configurationService.testEmailConfiguration(emailConfiguration).map(Right(_))
      }
    }

  def configureEmail: Action[EmailConfiguration] =
    Action.async(parseJson[EmailConfiguration]) { implicit request =>
      ApiResponse {
        val emailConfiguration = request.body

        configurationService.updateConfiguration(emailConfiguration)
      }
    }

}
