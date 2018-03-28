package io.cumulus.core.stream.utils

import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.stream.{Attributes, FlowShape, Inlet, Outlet}
import akka.util.ByteString
import io.cumulus.core.utils.Range

// TODO doc
class ByteRange(range: Range) extends GraphStage[FlowShape[ByteString, ByteString]] {
  val in = Inlet[ByteString]("ByteRange.in")
  val out = Outlet[ByteString]("ByteRange.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    private var read: Long = 0

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        if (isClosed(in))
          completeStage()
        else
          pull(in)
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        val bytes = grab(in)

        if(range.end < read || range.start > (read + bytes.size)) {
          // Skip the bytes & ask for more
          read += bytes.size
          pull(in)
        } else {

          val from = if(range.start > read)
            range.start - read
          else
            0

          val to = if(range.end < (read + bytes.size))
            from + (range.end -read)
          else
            bytes.size

          // Push the slice
          push(out, bytes.drop(from.toInt).take((to - from).toInt))

          // Update the state
          read += bytes.size
        }
      }

      override def onUpstreamFinish(): Unit = {
        // We have no buffer, complete immediately
        completeStage()
      }

    })

  }
}

object ByteRange {

  def apply(range: Range): ByteRange =
    new ByteRange(range)

  def apply(from: Long, to: Long): ByteRange =
    ByteRange(Range(from, to))

}
