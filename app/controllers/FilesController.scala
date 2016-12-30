package controllers

import javax.inject.{Inject, Singleton}

import models.Path
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}

@Singleton
class FilesController @Inject() (
  val accountRepo: AccountRepository,
  val directoryRepo: DirectoryRepository,
  val fileRepo: FileRepository,
  val auth: AuthActionService,
  val messagesApi: MessagesApi
) extends BaseController {

  def show(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    fileRepo.getByPath(cleanedPath)(account) match {
      case Right(file) =>
        Ok(Json.toJson(file))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  def create(path: String) = auth.AuthAction { implicit request =>

    val cleanedPath = Path.sanitize(path)
    val account = request.account

    fileRepo.insert(models.File.initFrom(cleanedPath, account))(account) match {
      case Right(file) =>
        Ok(Json.toJson(file))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }
}
