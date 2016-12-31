package utils

import java.io.FileOutputStream

import akka.stream.{Attributes, Outlet, Inlet, FlowShape}
import akka.stream.stage.{InHandler, OutHandler, GraphStageLogic, GraphStage}
import akka.util.ByteString

import utils.FileSplitter.FileSplitterState

class FileSplitter(val chunkSize: Int) extends GraphStage[FlowShape[ByteString, java.io.File]] {
  val in = Inlet[ByteString]("FileSplitter.in")
  val out = Outlet[java.io.File]("FileSplitter.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    // The sequence of files created
    private var files: Seq[java.io.File] = Seq()
    // The current state
    private var state = FileSplitterState.empty

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        if (isClosed(in)) emitFile()
        else pull(in)
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        write(grab(in))
        emitFile()
      }

      override def onUpstreamFinish(): Unit = {
        // Close the writer and add to the ready list
        state.fileOut.close()
        files = files :+ state.file

        if (files.isEmpty)
          completeStage()
        else if (isAvailable(out))
          emitFile()
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
        files = files :+ state.file // Add to the ready list

        // Create a new state
        state = state.next

        write(bufferNext)
      } else {
        // File not full, write
        state.fileOut.write(buffer.toArray)
        state = state.copy(written = state.written + buffer.length)
      }
    }

    private def emitFile(): Unit = {
      files match {
        case Seq() =>
          if (isClosed(in))
            completeStage()
          else
            pull(in)
        case head :: tail =>
          files = tail
          push(out, head)
      }
    }

  }

}

object FileSplitter {
  def randomFilename: String = "tmp/" + java.util.UUID.randomUUID.toString

  case class FileSplitterState(written: Int, fileOut: FileOutputStream, file: java.io.File) {
    def next: FileSplitterState = {
      val randomFile: java.io.File = new java.io.File(randomFilename)
      this.copy(0, new FileOutputStream(randomFile), randomFile)
    }
  }

  object FileSplitterState {
    def empty: FileSplitterState = {
      val randomFile: java.io.File = new java.io.File(randomFilename)
      FileSplitterState(0, new FileOutputStream(randomFile), randomFile)
    }
  }

  def apply(chunkSize: Int): FileSplitter = new FileSplitter(chunkSize)
}
