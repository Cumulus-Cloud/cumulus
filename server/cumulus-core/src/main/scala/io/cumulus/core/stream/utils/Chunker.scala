package io.cumulus.core.stream.utils

import akka.stream.scaladsl.{Flow, Source}
import akka.stream.stage._
import akka.stream.{Attributes, FlowShape, Inlet, Outlet}
import akka.util.ByteString

/**
  * Splits and/or merge incoming `ByteString` to ensure that every `ByteString` outputted is the exact same length,
  * excepted for the last one of the stream which may be shorter.
  * <br/><br/>
  * This stage is used in conjunction with `splitWhen` to know when to split a stream in multiple sub-streams of a
  * predefined size.
  *
  * @param chunkSize The chunk size, in byte.
  * @see [[https://doc.akka.io/docs/akka/2.5/scala/stream/stream-cookbook.html#working-with-io]]
  */
class Chunker(chunkSize: Int) extends GraphStage[FlowShape[ByteString, ByteString]] {

  private val in: Inlet[ByteString]   = Inlet[ByteString]("Chunker.in")
  private val out: Outlet[ByteString] = Outlet[ByteString]("Chunker.out")

  override val shape: FlowShape[ByteString, ByteString] = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    @SuppressWarnings(Array("org.wartremover.warts.Var"))
    private var buffer = ByteString.empty

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        if (isClosed(in) || buffer.size >= chunkSize)
          emitChunk()
        else
          pull(in)
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        val elem = grab(in)
        buffer ++= elem
        emitChunk()
      }

      override def onUpstreamFinish(): Unit = {
        if (buffer.isEmpty) {
          completeStage()
        } else {
          // There are elements left in buffer, so we keep accepting downstream pulls and push from buffer until
          // emptied.
          //
          // It might be though, that the upstream finished while it was pulled, in which case we will not get an
          // onPull from the downstream, because we already had one. In that case we need to emit from the buffer.
          if (isAvailable(out))
            emitChunk()
        }
      }
    })

    private def emitChunk(): Unit = {
      if (buffer.isEmpty) {
        if (isClosed(in))
          completeStage()
        else
          pull(in)
      } else {
        val (chunk, nextBuffer) = buffer.splitAt(chunkSize)
        buffer = nextBuffer
        push(out, chunk)
      }
    }

  }
}

object Chunker {

  /**
    * Splits and/or merge incoming `ByteString` to ensure that every `ByteString` outputted is the exact same length.
    *
    * @see [[io.cumulus.core.stream.utils.Chunker Chunker]]
    */
  def apply(chunkSize: Int): Chunker =
    new Chunker(chunkSize)

  /**
    * Uses the chunker to split the incoming stream in an arbitrary number of sequential sub-streams of a defined size.
    * Note that the last stream can be under the defined size.
    * <br/><br/>
    * The operation is not made in memory like `grouped`, and can used for large flow of data.
    * <br/><br/>
    * This works by using `Chunked` to group bytes by a defined (small) size, and then counting the number of this
    * groups and thus guessing the total number of bytes passed through. The split is made using `splitAfter`.
    *
    * @param splitBy The total amount of byte to send to each sub-stream.
    * @param chunkSize The size of a chunk, defaulted to 8096.
    * @see [[io.cumulus.core.stream.utils.Chunker Chunker]]
    */
  def splitter(splitBy: Long, chunkSize: Int = 8096) = {

    val splitEvery = splitBy / chunkSize

    Flow[ByteString]
      .via(Chunker(chunkSize))
      .zip(Source.fromIterator(() => Iterator.from(1)))
      .splitAfter(r => r match {
        // Split each time a new file should be written
        case (_, i) =>
          i > 0 && (i % splitEvery == 0)
      })
      .map(_._1)
  }

}
