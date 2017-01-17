package utils

import akka.stream.{Attributes, Outlet, Inlet, FlowShape}
import akka.stream.stage.{InHandler, OutHandler, GraphStageLogic, GraphStage}
import models.FileChunk
import storage.FileStorageEngine
import utils.ChunkRedundancer.ChunkRedundancerState

class ChunkRedundancer(storageEngine: FileStorageEngine) extends GraphStage[FlowShape[FileChunk, FileChunk]] with Log {

  val in = Inlet[FileChunk]("ChunkRedundancer.in")
  val out = Outlet[FileChunk]("ChunkRedundancer.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {

    // The storage engine used
    private implicit val engine: FileStorageEngine = storageEngine
    private var state  = ChunkRedundancerState(-1, None)

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        println("ChunkRedundancer - onPull")


        write()
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        println("ChunkRedundancer - onPush")

        read()
        write()
      }

      override def onUpstreamFinish(): Unit = {
        println("ChunkRedundancer - onUpstreamFinish")
        write()
      }
    })

    private def read() = {
      val chunk = grab(in)

      if(chunk.position == state.last /*|| !engine.isAvailable(chunk)*/) { // TODO
        println("ignored")
        // Ignore
        // pull(in) ?
      } else if(chunk.position < state.last || chunk.position > state.last + 1) {
        failStage(new Exception(s"Integrity error (chunk order seems wrong, got ${state.last}, then ${chunk.position})"))
        logger.warn(s"Chunk order seems wrong (got ${state.last}, then ${chunk.position})")
      } else
        state = state.copy(chunk = Some(chunk))

    }

    private def write() = {

      state.chunk match {
        case Some(chunk) =>
          println("ChunkRedundancer - write ", chunk.toString)
          push(out, chunk)
          state = state.copy(last = chunk.position, chunk = None)
        case None if !isClosed(in) =>
          println("ChunkRedundancer - write null")
          pull(in)
        case _ =>
          println("ChunkRedundancer - completed")
          completeStage()
      }

    }

  }
}

object ChunkRedundancer {

  case class ChunkRedundancerState(last: Int, chunk: Option[FileChunk])

  def apply(storageEngine: FileStorageEngine): ChunkRedundancer = new ChunkRedundancer(storageEngine)
}
