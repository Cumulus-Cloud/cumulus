package utils

import java.io.InputStream
import java.security.MessageDigest
import java.util.Base64

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
  * @param offset The offset
  */
class FileJoiner(storageEngine: FileStorageEngine, val bufferSize: Int, var range: Int) extends GraphStage[FlowShape[FileChunk, ByteString]] with Log {
  val in = Inlet[FileChunk]("FileJoiner.in")
  val out = Outlet[ByteString]("FileJoiner.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    // The storage engine used
    private implicit val engine: FileStorageEngine = storageEngine
    // The current state
    private var state = FileJoinerState.empty
    private var offset = range

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        println("onPull")

        // If the the current internal chunk stream is not close, emit bytes
        if (state.hasMore) emitBytes()
        // Else, try to get another chunk to read from if not closed
        else if (!isClosed(in)){
          pull(in)
          println("pull(in)")
        }
        // Closed and empty, complete the stage
        else {
          println("completeStage")
          completeStage()
        }

      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        //println("onPush")
        // On emit from the in stream, grab the chunk and start emitting
        read(grab(in))
        if(state.hasMore)
          emitBytes()
        //else
          //pull(in)
      }

      override def onUpstreamFinish(): Unit = {
        if (!state.hasMore)
          completeStage()
        else if (isAvailable(out))
          emitBytes()
      }
    })

    /**
      * Read a new chunk, taking into account any offset defined
      *
      * @param chunk The chunk to read
      */
    private def read(chunk: FileChunk): Unit = {
      // Start reading a new chunk, update the state
      state = FileJoinerState.init(chunk)
      logger.debug(s"Chunk ${state.chunk.id} reading from ${storageEngine.name} v${storageEngine.version}")
      // Update the offset
      if(offset >= chunk.size) {
        state = state.copy(closed = true) // Ignore
        state.fileIn.close()

        offset = offset - chunk.size.toInt

        println(s"chunk ${chunk.position} skipped")
        println(s"offset to $offset")
        // TODO pull ?
        pull(in)
      } else if(offset > 0) {
        state.fileIn.skip(offset.toLong)
        state = state.copy(read = offset.toInt)

        offset = 0

        println(s"chunk ${chunk.position} partially skipped")
        println(s"offset to $offset")
      } else
        println(s"chunk ${chunk.position} not skipped")
    }

    /**
      * Check the integrity of the last chunk, by comparing the number of bytes sent to the size of the chunk, and
      * then the chunk hash to the hash of the send data
      *
      * @param totalRead The total number of byte read
      * @param readHash The hash of all the bytes read
      */
    private def checkIntegrity(totalRead: BigInt, readHash: String) : Unit = {
      if(state.chunk.size != totalRead) {
        failStage(new Exception(s"Integrity error (file chunk size and read size differs, $totalRead != ${state.chunk.size})"))
        logger.warn(s"Chunk ${state.chunk.id} integrity test KO on length")
      } else if(readHash != state.chunk.hash) {
        failStage(new Exception(s"Integrity error (chunk hash and read hash differs)"))
        logger.warn(s"Chunk ${state.chunk.id} integrity test KO on hash")
      } else
        logger.debug(s"Chunk ${state.chunk.id} integrity test OK")
    }

    /**
      * Emit bytes from the current chunk. If the current chunk is done, the stream is closed and a
      * new chunk is requested until no more chunks are available
      */
    private def emitBytes(): Unit = {
      println("emitBytes")
      // Read some data from the chunk
      val buffer = new Array[Byte](bufferSize)
      val read = state.fileIn.read(buffer)

      // EOF, and nothing to send
      if(read < 0) {
        state.fileIn.close()

        // Check integrity..
        /*checkIntegrity(
          state.read,
          Base64.getEncoder.encodeToString(state.hashDigest.digest)
        )*/
        println("EOF")

        // Update the state
        state = state.copy(closed = true)
      } else {

        // EOF, but some bytes to send
        if (read < bufferSize || state.read + read >= state.chunk.size) {
          state.fileIn.close()
          push(out, ByteString(buffer.slice(0, read))) // Push last chunk

          // Check integrity..
          /*checkIntegrity(
            state.read + read,
            Base64.getEncoder.encodeToString(state.hashDigest.digest(buffer.slice(0, read)))
          )*/
          println(s"some byte $read + EOF")

          // Update the state
          state = state.copy(read = state.read + read, closed = true)
        }
        // Still readable, just push data
        else {
          push(out, ByteString(buffer))
          println(s"some bytes $read")

          // Update the state
          state.hashDigest.update(buffer)
          state = state.copy(read = state.read + read)
        }
      }
    }

  }

}

object FileJoiner {

  /**
    * File joiner state
    *
    * @param read Number of bytes read
    * @param fileIn The chunk input stream
    * @param chunk The current chunk read
    * @param closed True if the stream has been closed, false otherwise
    */
  case class FileJoinerState(read: Int, fileIn: InputStream, chunk: FileChunk, closed: Boolean = false, hashDigest: MessageDigest) {
    def hasMore = read < chunk.size && !closed
  }

  object FileJoinerState {
    def empty(implicit storageEngine: FileStorageEngine): FileJoinerState = {
      FileJoinerState(0, null, FileChunk.initFrom(storageEngine), closed = true, null) // TODO clean empty state
    }

    def init(chunk: FileChunk)(implicit storageEngine: FileStorageEngine) =
      FileJoinerState(0, storageEngine.readChunk(chunk.id), chunk, closed = false, MessageDigest.getInstance("MD5"))
  }

  def apply(storageEngine: FileStorageEngine, bufferSize: Int = 1024, offset: Int = 0): FileJoiner = new FileJoiner(storageEngine, bufferSize, offset)
}
