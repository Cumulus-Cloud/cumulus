package controllers

import javax.inject.{Inject, Singleton}

import models.{Path, Directory}
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}

@Singleton
class DirectoriesController @Inject() (
  val accountRepo: AccountRepository,
  val directoryRepo: DirectoryRepository,
  val fileRepo: FileRepository,
  val auth: AuthActionService,
  val messagesApi: MessagesApi
) extends BaseController {

  def list(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    directoryRepo.getByPath(cleanedPath)(account) match {
      case Right(directory) =>
        Ok(Json.toJson(directory))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  def create(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    directoryRepo.insert(Directory.initFrom(cleanedPath, account))(account) match {
      case Right(directory) =>
        Ok(Json.toJson(directory))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

}
