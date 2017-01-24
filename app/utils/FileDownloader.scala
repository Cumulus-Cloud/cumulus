package utils

import java.io.InputStream
import java.security.MessageDigest
import java.util.Base64

import akka.stream._
import akka.stream.stage.{GraphStage, GraphStageLogic, OutHandler}
import akka.util.ByteString
import models.FileSource
import storage.FileStorageEngine
import utils.FileDownloader.FileDownloaderState

/**
  * Custom file joiner, transforming a stream of FileChunks into a stream of ByteStrings, aiming to be used as a
  * Akka stream Flow[FileChunk, ByteString]. The bytes are then streamed back as soon as they are available.
  *
  * The provided file storage engine should handle the stream creation allowing the chunks to be read. The chunks should be
  * passed sequentially as no verification will be done on the file integrity at the moment
  *
  * @param storageEngine The storage engine used
  * @param bufferSize The buffer size to read. Default is 4096
  * @param rangeStart The offset start
  * @param rangeStop The max of bytes to read
  */
class FileDownloader(storageEngine: FileStorageEngine, source: FileSource, val bufferSize: Int, val rangeStart: Int, val rangeStop: Int = -1) extends GraphStage[SourceShape[ByteString]] with Log {

  val out = Outlet[ByteString]("FileDownloader.out")
  override val shape = SourceShape.of(out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    // The storage engine used
    private implicit val engine: FileStorageEngine = storageEngine
    // The current state
    private var state = {
      val state = FileDownloaderState.init(source)
      if(rangeStart > 0)
        state.fileIn.skip(rangeStart)
      state
    }
    private val max = if(rangeStop > 0 && rangeStop < source.size) rangeStop else source.size.toInt

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        if (state.hasMore)
          emitBytes()
        else
          completeStage()
      }
    })

    /**
      * Check the integrity of a downloaded file, by comparing the number of bytes sent to the size of the file, and
      * then the file hash to the hash of the send data
      *
      * @param totalRead The total number of byte read
      * @param readHash The hash of all the bytes read
      */
    private def checkIntegrity(totalRead: BigInt, readHash: String) : Unit = {
      if(state.source.size != totalRead) {
        failStage(new Exception(s"Integrity error (file chunk size and read size differs, $totalRead != ${state.source.size})"))
        logger.warn(s"Chunk ${state.source.id} integrity test KO on length")
      } else if(readHash != state.source.hash) {
        failStage(new Exception(s"Integrity error (chunk hash and read hash differs)"))
        logger.warn(s"Chunk ${state.source.id} integrity test KO on hash")
      } else
        logger.debug(s"Chunk ${state.source.id} integrity test OK")
    }

    /**
      * Emit bytes from the source. If the source is done, the stream is closed and the stage is completed at the new
      * pull
      */
    private def emitBytes(): Unit = {
      // Read some data from the chunk
      val buffer = new Array[Byte](bufferSize)
      val read = state.fileIn.read(buffer)

      // Some data read, push
      if(read > 0) {
        val length = if(state.read + read > max)
          max - state.read
        else
          read

        push(out, ByteString.fromArray(buffer, 0, length))

        // Update the state
        state.hashDigest.update(buffer, 0, length)
        state = state.copy(read = state.read + length)
      }

      // EOF
      if(read <= 0 || (read < bufferSize || state.read >= max)) {
        // Close the source stream
        state.fileIn.close()

        // Update the state
        state = state.copy(closed = true)

        // Check integrity (only check with no offset/max)
        if(rangeStart <= 0 && max >= state.source.size)
          checkIntegrity(
            state.read,
            Base64.getEncoder.encodeToString(state.hashDigest.digest)
          )
      }
    }

  }

}

object FileDownloader {

  /**
    * File joiner state
    *
    * @param read Number of bytes read
    * @param fileIn The chunk input stream
    * @param source The current file source to read
    * @param closed True if the stream has been closed, false otherwise
    */
  case class FileDownloaderState(read: Int, fileIn: InputStream, source: FileSource, closed: Boolean = false, hashDigest: MessageDigest) {
    def hasMore = read < source.size && !closed
  }

  object FileDownloaderState {
    def init(source: FileSource)(implicit storageEngine: FileStorageEngine) = {
      val sourceStream = storageEngine.readChunk(source.id)
      FileDownloaderState(0, sourceStream, source, closed = false, MessageDigest.getInstance("MD5"))
    }
  }

  def apply(storageEngine: FileStorageEngine, source: FileSource, offset: Int = 0, max: Int = -1, bufferSize: Int = 8096): FileDownloader = new FileDownloader(storageEngine, source, bufferSize, offset, max)
}
