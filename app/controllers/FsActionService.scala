package controllers

import javax.inject.Inject

import models.{Account, Path}
import play.api.mvc._
import utils.{Conf, Log}

import scala.concurrent.Future

class FsActionService @Inject()(
  conf: Conf,
  auth: AuthenticationActionService
) extends Log {

  case class RequestWithPath[A](filePath: String, account: Account, request: Request[A]) extends WrappedRequest[A](request)

  def ActionWithPath(path: String) = new ActionRefiner[AuthenticatedRequest, RequestWithPath] {
    def refine[A](request: AuthenticatedRequest[A]) = Future.successful {
      Path.sanitize(path) match {
        case p if p.isEmpty => Left(Results.BadRequest("TODO invalid path")) // TODO
        case p => Right(RequestWithPath(p,request.account, request))
      }
    }
  }

  def AuthenticatedActionWithPath(path: String) = auth.AuthenticatedAction andThen ActionWithPath(path)

}
