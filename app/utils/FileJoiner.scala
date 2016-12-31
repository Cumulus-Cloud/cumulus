package utils

import java.io.InputStream

import akka.stream.{Attributes, Outlet, Inlet, FlowShape}
import akka.stream.stage.{InHandler, OutHandler, GraphStageLogic, GraphStage}
import akka.util.ByteString
import models.FileChunk
import storage.FileStorageEngine
import utils.FileJoiner.FileJoinerState

class FileJoiner(storageEngine: FileStorageEngine, val bufferSize: Int) extends GraphStage[FlowShape[FileChunk, ByteString]] {
  val in = Inlet[FileChunk]("FileJoiner.in")
  val out = Outlet[ByteString]("FileJoiner.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    // The storage engine used
    private implicit val engine: FileStorageEngine = storageEngine
    // The current state
    private var state = FileJoinerState.empty

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        // If the the current internal chunk stream is not close, emit bytes
        if (state.hasMore) emitBytes()
        // Else, try to get another chunk to read from if not closed
        else if (!isClosed(in)) {
          pull(in)
        }
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        // On emit from the in stream, grab the chunk and start emitting
        read(grab(in))
        emitBytes()
      }

      override def onUpstreamFinish(): Unit = {
        if (!state.hasMore)
          completeStage()
        else if (isAvailable(out))
          emitBytes()
      }
    })

    private def read(chunk: FileChunk): Unit = {
      // Start reading a new chunk, update the state
      state = FileJoinerState(read = 0, fileIn = storageEngine.readChunk(chunk.id), chunk = chunk)
    }

    private def emitBytes(): Unit = {
      // Read some data from the chunk
      val buffer = new Array[Byte](bufferSize)
      val read = state.fileIn.read(buffer)

      // EOF, and nothing to send
      if(read < 0) {
        state.fileIn.close()
        // TODO check the size of the chunk and the read size ?

        // Update the state
        state = state.copy(closed = true)
      } else {

        // EOF, but some bytes to send
        if (read < bufferSize || state.read + read >= state.chunk.size) {
          state.fileIn.close()
          push(out, ByteString(buffer.slice(0, read))) // Push last chunk
          // TODO check the size of the chunk and the read size ?

          // Update the state
          state = state.copy(read = state.read + read, closed = true)
        }
        // Still readable, just push data
        else {
          push(out, ByteString(buffer))

          // Update the state
          state = state.copy(read = state.read + read)
        }
      }
    }

  }

}

object FileJoiner {

  case class FileJoinerState(read: Int, fileIn: InputStream, chunk: FileChunk, closed: Boolean = false) {
    def hasMore = read < chunk.size && !closed
  }

  object FileJoinerState {
    def empty(implicit storageEngine: FileStorageEngine): FileJoinerState = {
      FileJoinerState(0, null, FileChunk.initFrom(storageEngine), closed = true) // TODO clean empty state
    }
  }

  def apply(storageEngine: FileStorageEngine, bufferSize: Int = 1024): FileJoiner = new FileJoiner(storageEngine, bufferSize)
}
