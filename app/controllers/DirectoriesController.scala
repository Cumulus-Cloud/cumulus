package controllers

import javax.inject.{Inject, Singleton}

import controllers.FilesController.RequestWithFile
import models.{Account, File, Path, Directory}
import play.api.i18n.MessagesApi
import play.api.libs.json.Json
import play.api.mvc.{ActionRefiner, WrappedRequest, Request, Controller}
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import utils.Log

import scala.concurrent.Future

@Singleton
class DirectoriesController @Inject() (
  fsActions: FsActionService,
  auth: AuthenticationActionService,
  accountRepo: AccountRepository,
  directoryRepo: DirectoryRepository,
  fileRepo: FileRepository,
  messagesApi: MessagesApi
) extends Controller with Log {


  case class RequestWithDirectory[A](directory: Directory, account: Account, request: Request[A]) extends WrappedRequest[A](request)

  def ActionWithDirectory(path: String) =
    auth.AuthenticatedAction andThen
      fsActions.ActionWithPath(path) andThen
      new ActionRefiner[fsActions.RequestWithPath, RequestWithDirectory] {
        def refine[A](request: fsActions.RequestWithPath[A]) = Future.successful {
          val path = request.filePath
          val account = request.account

          directoryRepo.getByPath(path)(account) match {
            case Right(Some(dir)) => Right(RequestWithDirectory(dir, account, request))
            case Right(None) => Left(NotFound("TODO error")) // TODO
            case Left(e) => Left(BadRequest(Json.toJson(e)))
          }
        }
      }

  def delete(path: String) = ActionWithDirectory(path) {
    implicit request =>
      directoryRepo.delete(request.directory) match {
        case Right(_) =>
          Ok(Json.toJson(request.directory))
        case Left(e) =>
          BadRequest(Json.toJson(e))
      }
  }

  def list(path: String) = ActionWithDirectory(path) {
    implicit request =>
      Ok(Json.toJson(request.directory))
  }

  def create(path: String) = fsActions.AuthenticatedActionWithPath(path) {
    implicit request =>

      val path = request.filePath
      val account = request.account

      directoryRepo.insert(Directory.initFrom(path, account))(account) match {
        case Right(directory) =>
          Ok(Json.toJson(directory))
        case Left(e) =>
          BadRequest(Json.toJson(e))
      }
  }

}
