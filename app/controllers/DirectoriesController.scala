package controllers

import javax.inject.{Inject, Singleton}

import models.Directory
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
    val account = request.account
    directoryRepo.getByPath(s"/$path")(account) match {
      case Right(directory) =>
        Ok(Json.toJson(directory))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

  def create(path: String) = auth.AuthAction { implicit request =>
    val account = request.account
    directoryRepo.insert(Directory.initFrom(path, account))(account) match {
      case Right(directory) =>
        Ok(Json.toJson(directory))
      case Left(e) =>
        BadRequest(Json.toJson(e))
    }
  }

}
