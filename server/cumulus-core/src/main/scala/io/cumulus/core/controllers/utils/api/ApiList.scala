package io.cumulus.core.controllers.utils.api

import play.api.libs.json._
import play.api.mvc.Results

case class ApiList[T](items: Seq[T], total: Option[Int] = None) {
  def toResult(implicit wr: Writes[T]) = Results.Ok(Json.toJson(this))
}

object ApiList {
  implicit def writes[T](implicit wr: Writes[T]): Writes[ApiList[T]] = Writes { res =>
    val js = Json.obj(
      "items" -> JsArray(res.items.map(i => wr.writes(i))),
      "size"  -> res.items.size
    )
    res.total.map(t => js ++ Json.obj("total" -> t)).getOrElse(js)
  }
}
