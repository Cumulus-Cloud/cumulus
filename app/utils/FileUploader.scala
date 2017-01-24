package utils

import java.io.OutputStream
import java.security.MessageDigest
import java.util.Base64

import akka.stream.scaladsl.{Keep, Flow, Sink}
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.stream.{Attributes, FlowShape, Inlet, Outlet}
import akka.util.ByteString
import models.FileSource
import storage.FileStorageEngine
import utils.FileUploader.FileUploaderState

import scala.concurrent.Future

object FileUploaderSink {
  def apply(storageEngine: FileStorageEngine): Sink[ByteString, Future[FileSource]] =
    Flow[ByteString].via(FileUploader(storageEngine)).toMat(Sink.head)(Keep.right)
}

/**
  * Custom file splitter, transforming a stream of ByteStrings into a stream of FileChunks, aiming to be used as a
  * Akka stream Flow[ByteString, FileChunk]. The chunks are then streamed back as soon as they are created.
  *
  * The provided file storage engine is used to defined where and how will be stored the chunks. The maximum size of
  * the chunks is defined with the parameter chunkSize, while the last chunk may still be shorter (the real size of the
  * chunk is also defined in the chunk information itself)
  *
  * @param storageEngine The storage engine to use
  */
class FileUploader(storageEngine: FileStorageEngine) extends GraphStage[FlowShape[ByteString, FileSource]] with Log {
  val in = Inlet[ByteString]("FileUploader.in")
  val out = Outlet[FileSource]("FileUploader.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    // The storage engine used
    private implicit val engine: FileStorageEngine = storageEngine
    // The current state
    private var state = FileUploaderState.empty

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        if (!isClosed(in))
          pull(in)
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        write(grab(in))
      }

      override def onUpstreamFinish(): Unit = {
        // Close the writer and add to the ready list
        state.fileOut.close()

        state = state.copy(
          source = state.source.copy(
            hash = Base64.getEncoder.encodeToString(state.hashDigest.digest),
            size = state.written
          )
        )

        if (isAvailable(out)) {
          emitSource()
          completeStage()
        }
      }
    })

    /**
      * Write a buffer to a file source
      *
      * @param buffer The buffer to write
      */
    private def write(buffer: ByteString): Unit = {
      // Write
      state.fileOut.write(buffer.toArray)

      // Update state
      state.hashDigest.update(buffer.toArray)
      state = state.copy(written = state.written + buffer.length)

      // Need more to read
      pull(in)
    }

    /**
      * Emit the file source. The source is emitted once the file is fully written
      */
    private def emitSource(): Unit = {
      push(out, state.source)
    }

  }

}

object FileUploader {

  /**
    * File uploader state, keeping the current state of the uploader
    *
    * @param written The byte written to the chunk
    * @param fileOut The output chunk stream
    * @param source The file source
    * @param hashDigest The hash digest of the chunk
    */
  case class FileUploaderState(written: Int, fileOut: OutputStream, source: FileSource, hashDigest: MessageDigest)

  object FileUploaderState {
    def empty(implicit storageEngine: FileStorageEngine): FileUploaderState = {
      val source = FileSource.initFrom(storageEngine)
      FileUploaderState(0, storageEngine.createChunk(source.id), source, MessageDigest.getInstance("MD5"))
    }
  }

  def apply(storageEngine: FileStorageEngine): FileUploader = new FileUploader(storageEngine)
}
