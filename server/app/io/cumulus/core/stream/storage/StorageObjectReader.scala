package io.cumulus.core.stream.storage

import java.io.InputStream
import java.security.MessageDigest
import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream._
import akka.stream.scaladsl._
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.util.ByteString
import io.cumulus.core.Logging
import io.cumulus.core.stream.storage.StorageObjectReader.ObjectReaderState
import io.cumulus.core.stream.utils.{Counter, DigestCalculator}
import io.cumulus.core.utils.Base64
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}

/**
  * Transforms a flow of storage object into a flow of `ByteString`, reading the content of each object from the
  * provided storage engine.<br/>
  * <br/>
  * If used with a cipher and/or compression, the flow should be used with the splitting helper to allow individual
  * processing on each object.
  *
  * @param storageEngine The storage engine use (note that it should technically be retrieved directly from the objects)
  * @param bufferSize The buffer size to use, defaulted to 8096
  */
class StorageObjectReader(
  storageEngine: StorageEngine,
  bufferSize: Int = 8096
)(
  implicit ec: ExecutionContext
) extends GraphStage[FlowShape[StorageObject, ByteString]] with Logging {

  val in  = Inlet[StorageObject]("ObjectReader.in")
  val out = Outlet[ByteString]("ObjectReader.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {

    // The storage engine used
    private implicit val engine: StorageEngine = storageEngine

    // The current state
    private var state: ObjectReaderState = _

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        // If the the current internal chunk stream is not close, emit bytes
        if (state != null && state.hasMore)
          emitBytes()
        // Else, try to get another chunk to read from if not closed
        else if (!isClosed(in))
          pull(in)
        // Closed and empty, complete the stage
        else {
          completeStage()
        }
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        read(grab(in))
        emitBytes()
      }

      override def onUpstreamFinish(): Unit = {
        // Close the writer and add to the ready list
        if (!state.hasMore)
          completeStage()
        else if (isAvailable(out))
          emitBytes()
      }
    })

    /**
      * Update the state to the provided storage object.
      * @param storageObject The storage object to be read
      */
    private def read(storageObject: StorageObject): Unit = {
      state = ObjectReaderState(storageObject)

      logger.debug(s"Object ${state.storageObject.id} reading from ${storageEngine.name} v${storageEngine.version}")
    }

    /**
      * Emit bytes from the current object. If the current object is done, the stream is closed and a
      * new object is requested until no more objects are available
      */
    private def emitBytes(): Unit = {
      // Read some data from the chunk
      val buffer = new Array[Byte](bufferSize)
      val read = state.input.read(buffer)

      // EOF, and nothing to send
      if(read < 0) {
        state.input.close()

        // Check integrity..
        checkIntegrity(
          state.read,
          Base64.encode(state.hashDigest.digest)
        )

        // Update the state
        state = state.copy(closed = true)
      } else {

        // EOF, but some bytes to send
        if (read < bufferSize || state.read + read >= state.storageObject.storageSize) {
          state.input.close()
          push(out, ByteString(buffer.slice(0, read))) // Push last chunk

          // Check integrity..
          checkIntegrity(
            state.read + read,
            Base64.encode(state.hashDigest.digest(buffer.slice(0, read)))
          )

          // Update the state
          state = state.copy(read = state.read + read, closed = true)
        }
        // Still readable, just push data
        else {
          push(out, ByteString(buffer))

          // Update the state
          state.hashDigest.update(buffer)
          state = state.copy(read = state.read + read)
        }
      }
    }

    /**
      * Check the integrity of the last object, by comparing the number of bytes sent to the size of the object, and
      * then the object hash to the hash of the data sent.
      *
      * @param totalRead The total number of byte read
      * @param readHash The hash of all the bytes read
      */
    private def checkIntegrity(totalRead: BigInt, readHash: String) : Unit = {
      if(totalRead != state.storageObject.storageSize) {
        failStage(new Exception(s"Integrity error (file chunk size and read size differs, $totalRead != ${state.storageObject.size})"))
        logger.warn(s"Object ${state.storageObject.id} integrity test KO on length")
      } else if(readHash != state.storageObject.storageHash) {
        failStage(new Exception(s"Integrity error (chunk hash and read hash differs)"))
        logger.warn(s"Object ${state.storageObject.id} integrity test KO on hash")
      } else
        logger.debug(s"Object ${state.storageObject.id} integrity test OK")
    }

  }

}

object StorageObjectReader {

  private case class ObjectReaderState(
    read: Int,
    input: InputStream,
    storageObject: StorageObject,
    closed: Boolean = false,
    hashDigest: MessageDigest
  ) {

    def hasMore: Boolean =
      read < storageObject.storageSize && !closed

  }

  private object ObjectReaderState {

    def apply(storageObject: StorageObject)(implicit storageEngine: StorageEngine, ec: ExecutionContext): ObjectReaderState = {
      val input = storageEngine.readObject(storageObject.id)

      ObjectReaderState(
        read = 0,
        input,
        storageObject,
        closed = false,
        MessageDigest.getInstance("SHA1")
      )
    }

  }

  /**
    * @see [[io.cumulus.core.stream.storage.StorageObjectReader]]
    */
  def apply(storageEngine: StorageEngine)(implicit ec: ExecutionContext): StorageObjectReader =
    new StorageObjectReader(storageEngine)

  /**
    * @see [[io.cumulus.core.stream.storage.StorageObjectReader]]
    */
  def apply(storageEngine: StorageEngine, bufferSize: Int)(implicit ec: ExecutionContext): StorageObjectReader =
    new StorageObjectReader(storageEngine, bufferSize)

  /**
    * Apply a transformation to a reader.
    *
    * @param storageEngine The storage engine to use
    * @param transformation The transformation to perform
    * @see [[io.cumulus.core.stream.storage.StorageObjectReader]]
    */
  def apply(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed],
    bufferSize: Int = 8096
  )(implicit ec: ExecutionContext): Flow[StorageObject, ByteString, NotUsed] = {

    //Flow[StorageObject]
    //  .via(StorageObjectReader(storageEngine, bufferSize))
    //  .via(transformation)

    /*

    // Will compute the hash (SHA1) of a byte stream
    val hash = DigestCalculator.sha1

    // Will compute the total size of a byte stream
    val size = Counter.apply

    val graph = GraphDSL.create() { implicit builder =>
      val broadcastObject = builder.add(Broadcast[StorageObject](2))
      val broadcastContent = builder.add(Broadcast[ByteString](3))

      val readObject = Flow[StorageObject]
        .flatMapConcat { storageObject =>
          storageEngine
            .getObjectReader(storageObject.id)
          // TODO add integrity checks
        }

      val checkIntegrity = builder.add(ZipWith[StorageObject, Long, String, Long, String, StorageObject] {
        case (storageObject, storageSize, storageHash, chunkSize, chunkHash) =>
          storageObject.copy(
            hash = chunkHash,
            size = chunkSize,
            storageHash = storageHash,
            storageSize = storageSize
          )
      })

      val zip = builder.add(ZipWith[StorageObject, Long, String, StorageObject] {
        case (storageObject, storageSize, storageHash) =>
          if(storageSize != storageObject.storageSize) {
            //logger.warn(s"Object ${state.storageObject.id} integrity test KO on length")
            throw new Exception(s"Integrity error (file chunk size and read size differs, $storageSize != ${storageObject.storageSize})"))
          } else if(storageHash != storageObject.storageHash) {
            //logger.warn(s"Object ${state.storageObject.id} integrity test KO on hash")
            throw new Exception(s"Integrity error (chunk hash and read hash differs)")
          } else {
            //logger.debug(s"Object ${state.storageObject.id} integrity test OK")
            storageObject
          }
      })

      import GraphDSL.Implicits._

      broadcastObject ~> readObject ~> broadcastContent ~> transformation
                                       broadcastContent ~> size         ~> zip.in1
                                       broadcastContent ~> hash         ~> zip.in2
      broadcastObject                                                   ~> zip.in0

      FlowShape(broadcast.in, transformation.shape.out)
    }*/

    val hash = DigestCalculator.sha1

    Flow[StorageObject]
      .flatMapConcat { storageObject =>
        val switch = KillSwitches.single[ByteString]

        hash.toMat(Sink.foreach { hash =>
          if(storageObject.storageHash != hash)
            switch.
        })



        storageEngine
          .getObjectReader(storageObject.id)
          .viaMat(switch)(Keep.right)
          .alsoTo(hash.toMat(Sink.last)(Keep.both))
      }
      .via(transformation)

  }

}
