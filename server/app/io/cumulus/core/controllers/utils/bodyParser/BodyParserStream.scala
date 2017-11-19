package io.cumulus.core.controllers.utils.bodyParser

import scala.concurrent.ExecutionContext

import akka.stream.scaladsl.Source
import akka.util.ByteString
import play.api.libs.streams.Accumulator
import play.api.mvc.{BaseController, BodyParser}

trait BodyParserStream { self: BaseController =>

  def streamBody(implicit ec:ExecutionContext): BodyParser[Source[ByteString, _]] =
    BodyParser("Akka Stream pass-through") { implicit request =>
      Accumulator.source[ByteString].map(Right.apply)
    }

}
