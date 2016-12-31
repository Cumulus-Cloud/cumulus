package utils

import java.io.FileOutputStream

import akka.stream.scaladsl.Flow
import akka.util.ByteString

object FileSplitter2 {

  def randomFilename: String = "tmp/" + java.util.UUID.randomUUID.toString

  case class FileSplitterState(files: Seq[java.io.File], written: Int, fileOut: FileOutputStream) {
    def next: FileSplitterState = {
      val randomFile: java.io.File = new java.io.File(randomFilename)
      this.copy(files = files :+ randomFile, 0, new FileOutputStream(randomFile))
    }
  }

  object FileSplitterState {
    def empty: FileSplitterState = {
      val randomFile: java.io.File = new java.io.File(randomFilename)
      FileSplitterState(Seq(randomFile), 0, new FileOutputStream(randomFile))
    }
  }

  private def writeToChunkedFile(chunkSize : Int)(state : FileSplitterState, buffer : ByteString) : FileSplitterState = {
    if(state.written + buffer.length > chunkSize) {
      // Too much to read, slice into 2 ByteString
      val bufferCurrent = buffer.slice(0, chunkSize - state.written)
      val bufferNext = buffer.slice(bufferCurrent.length, buffer.size)

      // Fill the file, and close it
      state.fileOut.write(bufferCurrent.toArray)
      state.fileOut.close()

      // Write the remaining chunk
      writeToChunkedFile(chunkSize)(state.next, bufferNext)
    } else {
      // Write & update the state
      state.fileOut.write(buffer.toArray)
      state.copy(written = state.written + buffer.length)
    }
  }

  def apply(chunkSize : Int) : Flow[ByteString, Seq[java.io.File], _] =
    Flow[ByteString].fold(FileSplitterState.empty)(writeToChunkedFile(chunkSize)).map(state => {
      state.fileOut.close()
      state.files
    })
}
