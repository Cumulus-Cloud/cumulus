package utils

import java.io.InputStream

import akka.stream.{Attributes, Outlet, Inlet, FlowShape}
import akka.stream.stage.{InHandler, OutHandler, GraphStageLogic, GraphStage}
import akka.util.ByteString
import models.FileChunk
import storage.FileStorageEngine
import utils.FileJoiner.FileJoinerState

/**
  * Custom file joiner, transforming a stream of FileChunks into a stream of ByteStrings, aiming to be used as a
  * Akka stream Flow[FileChunk, ByteString]. The bytes are then streamed back as soon as they are available.
  *
  * The provided file storage engine should handle the stream creation allowing the chunks to be read. The chunks should be
  * passed sequentially as no verification will be done on the file integrity at the moment
  *
  * @param storageEngine The storage engine used
  * @param bufferSize The buffer size to read. Default is 4096
  */
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
        else if (!isClosed(in)) pull(in)
        // Closed and empty, complete the stage
        else completeStage()
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

    /**
      * Read a new chunk
      * @param chunk The chunk to read
      */
    private def read(chunk: FileChunk): Unit = {
      // TODO compute a hash for every chunk and check ?
      // TODO de-zip ?
      // Start reading a new chunk, update the state
      state = FileJoinerState(read = 0, fileIn = storageEngine.readChunk(chunk.id), chunk = chunk)
    }

    /**
      * Emit bytes from the current chunk. If the current chunk is done, the stream is closed and a
      * new chunk is requested until no more chunks are available
      */
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

  /**
    * File joiner state
    * @param read Number of bytes read
    * @param fileIn The chunk input stream
    * @param chunk The current chunk read
    * @param closed True if the stream has been closed, false otherwise
    */
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
