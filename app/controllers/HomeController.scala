package controllers

import javax.inject._

import akka.actor.ActorSystem
import akka.stream._
import akka.stream.scaladsl.Source
import akka.util.ByteString
import models.{Directory, File}
import play.api.Configuration
import play.api.i18n.MessagesApi
import play.api.libs.json._
import play.api.libs.streams.Accumulator
import play.api.mvc._
import repositories.AccountRepository
import repositories.filesystem.{DirectoryRepository, FileRepository}
import storage.LocalStorageEngine
import utils.EitherUtils._

/**
  * Test zone do not touch/use :)
  */
@Singleton
class HomeController @Inject() () extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

}
