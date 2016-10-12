package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import play.modules.reactivemongo._

@Singleton
class HomeController @Inject() (
  val reactiveMongoApi: ReactiveMongoApi
) extends Controller with MongoController with ReactiveMongoComponents {

  def index = Action {
    Ok(views.html.index())
  }

}
