package utils

import java.io.OutputStream

import akka.stream.{Attributes, Outlet, Inlet, FlowShape}
import akka.stream.stage.{InHandler, OutHandler, GraphStageLogic, GraphStage}
import akka.util.ByteString
import models.FileChunk
import storage.FileStorageEngine

import utils.FileSplitter.FileSplitterState

/**
  * Custom file splitter, transforming a stream of ByteStrings into a stream of FileChunks, aiming to be used as a
  * Akka stream Flow[ByteString, FileChunk]. The chunks are then streamed back as soon as they are created.
  *
  * The provided file storage engine is used to defined where and how will be stored the chunks. The maximum size of
  * the chunks is defined with the parameter chunkSize, while the last chunk may still be shorter (the real size of the
  * chunk is also defined in the chunk information itself)
  *
  * @param storageEngine The storage engine to use
  * @param chunkSize The chunk size to use
  */
class FileSplitter(storageEngine: FileStorageEngine, val chunkSize: Int) extends GraphStage[FlowShape[ByteString, FileChunk]] {
  val in = Inlet[ByteString]("FileSplitter.in")
  val out = Outlet[FileChunk]("FileSplitter.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    // The storage engine used
    private implicit val engine: FileStorageEngine = storageEngine
    // The sequence of chunks created
    private var chunks: Seq[FileChunk] = Seq()
    // The current state
    private var state = FileSplitterState.empty

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        // Nothing to read from, emit the last chunk
        if (isClosed(in)) emitChunk()
        // Else, pull data to add to the chunk
        else pull(in)
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        write(grab(in))
        emitChunk()
      }

      override def onUpstreamFinish(): Unit = {
        // Close the writer and add to the ready list
        state.fileOut.close()
        chunks = chunks :+ state.chunk.copy(size = state.written)

        if (chunks.isEmpty)
          completeStage()
        else if (isAvailable(out))
          emitChunk()
      }
    })

    private def write(buffer: ByteString): Unit = {
      // If the new chunk + the written chunks exceeds the maximum file size
      if(state.written + buffer.length > chunkSize) {
        // Slice into 2 ByteString
        val bufferCurrent = buffer.slice(0, chunkSize - state.written)
        val bufferNext = buffer.slice(bufferCurrent.length, buffer.size)

        // Write to the current file
        state.fileOut.write(bufferCurrent.toArray)
        state.fileOut.close()
        chunks = chunks :+ state.chunk.copy(size = state.written) // Add to the ready list

        // Create a new state
        state = state.next

        write(bufferNext)
      } else {
        // File not full, write
        state.fileOut.write(buffer.toArray)
        state = state.copy(written = state.written + buffer.length)
      }
    }

    private def emitChunk(): Unit = {
      chunks match {
        case Seq() =>
          if (isClosed(in))
            completeStage()
          else
            pull(in)
        case head :: tail =>
          chunks = tail
          push(out, head)
      }
    }

  }

}

object FileSplitter {

  /**
    * File splitter state, keeping the current state of the splitter
    * @param written The byte written to the chunk
    * @param fileOut The output chunk stream
    * @param chunk The chunk metadata
    */
  case class FileSplitterState(written: Int, fileOut: OutputStream, chunk: FileChunk) {
    def next(implicit storageEngine: FileStorageEngine): FileSplitterState = {
      val chunk = FileChunk.initFrom(storageEngine)
      this.copy(0, storageEngine.createChunk(chunk.id), chunk)
    }
  }

  object FileSplitterState {
    def empty(implicit storageEngine: FileStorageEngine): FileSplitterState = {
      val chunk = FileChunk.initFrom(storageEngine)
      FileSplitterState(0, storageEngine.createChunk(chunk.id), chunk)
    }
  }

  def apply(storageEngine: FileStorageEngine, chunkSize: Int): FileSplitter = new FileSplitter(storageEngine, chunkSize)
}
