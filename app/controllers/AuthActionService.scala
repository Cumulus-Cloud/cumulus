package controllers

import java.util.UUID
import javax.inject.Inject

import models.Account
import pdi.jwt.{JwtAlgorithm, JwtJson}
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.mvc._
import repositories.AccountRepository
import utils.{Conf, Log}

import scala.concurrent.Future
import scala.util.{Failure, Success}

case class AuthenticatedRequest[A](accound: Account, request: Request[A]) extends WrappedRequest[A](request)

class AuthActionService @Inject() (conf: Conf, accountRepository: AccountRepository) extends Log {
  val key = conf.cryptoKey

  object AuthAction extends ActionBuilder[AuthenticatedRequest] {
    override def invokeBlock[A](request: Request[A], block: (AuthenticatedRequest[A]) => Future[Result]): Future[Result] = {
      val errorResponse = Json.obj("error" -> "Unauthorized")
      request.headers.get("Authorization") match {
        case Some(header) =>
          logger.debug(s"${request.toString()} Authorization=$header")
          JwtJson.decodeJson(header, key, Seq(JwtAlgorithm.HS256)) match {
            case Success(json) =>
              (json \ "user_id").validate[UUID] match {
                case s: JsSuccess[UUID] =>
                  accountRepository.getByUUID(s.get) match {
                  case Some(user) =>
                    logger.debug(s"${request.toString()} user=$user")
                    block(AuthenticatedRequest(user, request))
                  case None =>
                    logger.error(s"Unauthorized: User not found with id=${s.get}")
                    Future.successful(Results.Unauthorized(errorResponse))
                  }
                case e: JsError =>
                  logger.error(s"Unauthorized: Jwt decode Json error $e")
                  Future.successful(Results.Unauthorized(errorResponse))
              }
            case Failure(e) =>
              logger.error(s"Unauthorized: Jwt decode Json error", e)
              Future.successful(Results.Unauthorized(errorResponse))
          }
        case None =>
          logger.error(s"Unauthorized: Missing Authorization header")
          Future.successful(Results.Unauthorized(errorResponse))
      }
    }
  }
}
