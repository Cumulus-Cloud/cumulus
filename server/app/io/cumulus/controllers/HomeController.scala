package io.cumulus.controllers

import scala.concurrent.{ExecutionContext, Future, Promise}

import akka.{Done, NotUsed}
import akka.stream.IOResult
import akka.stream.scaladsl.{Flow, Keep, Sink, Source}
import akka.util.ByteString
import io.cumulus.core.controllers.utils.api.ApiUtils
import io.cumulus.core.controllers.utils.authentication.Authentication
import io.cumulus.core.controllers.utils.bodyParser.BodyParserJson
import io.cumulus.models.UserSession
import play.api.mvc._


class HomeController (
  cc: ControllerComponents
)(
  implicit ec: ExecutionContext
) extends AbstractController(cc) with Authentication[UserSession] with ApiUtils with BodyParserJson {

  def index = Action {
    /*
    val p: Promise[IOResult] = Promise()
    val sink: Sink[ByteString, Future[IOResult]] = ???

    val sinkWithMap: Sink[ByteString, p.type] = sink.mapMaterializedValue { futIoResult =>
      p.completeWith(futIoResult)
    }

    val source = Source.fromFuture(p.future)
    val flow: Flow[ByteString, IOResult, NotUsed] = Flow.fromSinkAndSourceCoupled(sinkWithMap, source)

    def completitionFlow[A, Mat](sink: Sink[A, Mat]): Flow[A, Done.type, Mat] = {
      // never emits or completes on its own, but can still be cancelled
      val never = Source.fromFuture(Future.never)
      // the output will be cancelled when the input is done
      val coupled = Flow.fromSinkAndSourceCoupledMat(sink, never)(Keep.left)
      val output = Source.single(Done)
      coupled.orElse(output)
    }*/


/*


    val source: Source[String, NotUsed] = Source(List(ByteString("zz")))
    val sink: Sink[ByteString, Future[IOResult]] = FileIO.toPath(Paths.get("/something"))
    val stuff: Flow[Future[IOResult], String, NotUsed] = ???

    val huh: Flow[ByteString, String, Future[IOResult]] = Flow.fromSinkAndSourceCoupledMat(sink, source)((a, b) => a)

    huh.m
    */

    Ok(io.cumulus.views.html.index())
  }

  def testLogin = Action {
    Ok(io.cumulus.views.html.test.login())
  }

  def test = AuthenticatedAction.withErrorHandler { implicit request =>
    Ok(io.cumulus.views.html.test.index())
  } { _: Request[_] =>
    Future.successful(Redirect(routes.HomeController.testLogin()))
  }

}
