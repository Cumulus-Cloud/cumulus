package io.cumulus.core.stream.utils

import scala.language.implicitConversions

import akka.stream.scaladsl.Flow
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.stream.{Attributes, FlowShape, Inlet, Outlet}

// TODO doc
class FlatMap[I, O1, O2](src: Flow[I, O1, _], map: O1 => Flow[I, O2, _]) extends GraphStage[FlowShape[I, O2]] {

  override def createLogic(inheritedAttributes: Attributes) = new GraphStageLogic(shape) {

    class Pipe[I, O](name: String, onPush: SubSinkInlet[I] => Unit) { outer =>

      val out = new SubSourceOutlet[O](s"$name.out")
      out.setHandler(new OutHandler {

        override def onDownstreamFinish(): Unit = {
          completeIfNeeded()
        }

        override def onPull(): Unit = {
          if (hasBeenPulled(shape.in)) {
            pendingPulls += 1
          } else {
            pull(shape.in)
          }
        }

      })

      val in = new SubSinkInlet[I](s"$name.in")
      in.setHandler(new InHandler {

        override def onUpstreamFinish(): Unit = {
          completeIfNeeded()
        }

        override def onPush(): Unit = outer.onPush(in)

      })
    }

    var pendingPulls = 0
    var _lhs: Option[Pipe[O1, I]] = None
    var _rhs: Option[Pipe[O2, I]] = None

    private def completeIfNeeded(): Unit = {
      _rhs.foreach(e => if (e.in.isClosed && e.out.isClosed) _rhs = None)
      _lhs.foreach(e => if (e.in.isClosed && e.out.isClosed) _lhs = None)
      if (isAvailable(shape.out) && _rhs.isEmpty) {
        _lhs.foreach(e =>
                       if (!(e.in.isClosed || e.in.hasBeenPulled)) e.in.pull()
        )
      }
      if (_rhs.map(_.out.isClosed).getOrElse(true) && _lhs.isEmpty) {
        cancel(shape.in)
      }
      if (_rhs.map(_.in.isClosed).getOrElse(true) &&
        _lhs.map(_.in.isClosed).getOrElse(true))
      {
        complete(shape.out)
      }
      if (isClosed(shape.in) && isClosed(shape.out)) {
        completeStage()
      }
    }

    override def preStart(): Unit = {

      val lhs = new Pipe[O1, I]("lhs@FlatMap", onPush = { in =>

        val rhs = new Pipe[O2, I]("rhs@FlatMap", onPush = { in =>
          push(shape.out, in.grab())
        })
        _rhs = Some(rhs)
        map(in.grab()).runWith(rhs.out.source, rhs.in.sink)(materializer)

        if (isClosed(shape.in)) {
          rhs.out.complete()
        }
        if (isClosed(shape.out))
          rhs.in.cancel()
        else rhs.in.pull()
      })

      _lhs = Some(lhs)

      src.runWith(lhs.out.source, lhs.in.sink)(materializer)

    }

    setHandler(shape.in, new InHandler {

      override def onUpstreamFinish(): Unit = {
        completeIfNeeded()
        _lhs.foreach(_.out.complete())
        _rhs.foreach(_.out.complete())
      }

      override def onPush(): Unit = {
        val e = grab(shape.in)
        _rhs match {
          case None =>
            _lhs.foreach(
              _.out.push(e)
            )
          case Some(rhs) =>
            rhs.out.push(e)
        }
        if (pendingPulls > 0) {
          pendingPulls -= 1
          pull(shape.in)
        }
      }
    })

    setHandler(shape.out, new OutHandler {

      override def onDownstreamFinish(): Unit = {
        completeIfNeeded()
        _rhs.foreach(_.in.cancel())
      }

      override def onPull(): Unit = {
        _rhs match {
          case None =>
            _lhs.foreach(_.in.pull())
          case Some(rhs)  =>
            if (!rhs.in.isClosed) {
              rhs.in.pull()
            }
        }
      }
    })

  }

  override val shape = FlowShape.of(Inlet[I]("FlatMap.in"), Outlet[O2]("FlatMap.out"))

}

/**
  * TODO documentation
  */
object FlowExtensions {
  implicit class FlowOps[I, O](val flow: Flow[I, O, _]) extends AnyVal {
    def flatMap[OO](f: O => Flow[I, OO, _]): Flow[I, OO, _] = Flow.fromGraph(new FlatMap[I, O, OO](flow, f))
  }
}
