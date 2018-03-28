package io.cumulus.core.stream.utils

import scala.concurrent.Future

import akka.Done
import akka.stream.scaladsl.{Flow, Keep, Sink, Source}

// TODO documentation
object SinkExtensions {

  // TODO documentation
  def completionFlow[A, Mat](sink: Sink[A, Mat]): Flow[A, Done.type, Mat] = {
    // Never emits or completes or fails on its own, but can still be cancelled
    val never = Source.fromFuture(Future.never)

    // Never emits on its own, but can be cancelled from downstream, and will complete/fail when sink completes/fails
    val coupled = Flow.fromSinkAndSourceCoupledMat(sink, never)(Keep.left)

    // Only ever emits the output single element when sink is complete, then completes itself. Propagates cancellation
    // upstream and failure downstream
    coupled.orElse(Source.single(Done))
  }

  // TODO documentation
  implicit class SinkOps[A, Mat](val sink: Sink[A, Mat]) extends AnyVal {
    def toFlow: Flow[A, Done.type, Mat] = completionFlow(sink)
  }

}
