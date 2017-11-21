package io.cumulus.core.stream.storage

import java.io.OutputStream
import java.security.MessageDigest
import java.time.LocalDateTime
import java.util.UUID
import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream._
import akka.stream.scaladsl.{Broadcast, Flow, GraphDSL, ZipWith}
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.util.ByteString
import io.cumulus.core.Logging
import io.cumulus.core.stream.storage
import io.cumulus.core.stream.storage.StorageObjectWriter.ObjectWriterState
import io.cumulus.core.stream.utils.{Counter, DigestCalculator}
import io.cumulus.core.utils.Base64
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}

/**
  * Write a stream of `ByteString` into a storage object, and then returns this storage object in the stream. The
  * storage object will contains the object size and hash.
  *
  * @param storageEngine The storage engine to use
  */
class StorageObjectWriter(storageEngine: StorageEngine)(implicit ec: ExecutionContext) extends GraphStage[FlowShape[ByteString, StorageObject]] with Logging {

  val in  = Inlet[ByteString]("ObjectWriter.in")
  val out = Outlet[StorageObject]("ObjectWriter.out")
  override val shape = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {

    // The storage engine used
    private implicit val engine: StorageEngine = storageEngine

    // The current state
    private var state = ObjectWriterState.empty

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
        state.output.close()

        val hash = Base64.encode(state.hashDigest.digest)

        state = state.copy(
          storageObject = state.storageObject.copy(
            hash = hash,
            size = state.written,
            storageHash = hash, // By default, assume that the object is written directly
            storageSize = state.written
            // TODO add cipher and/or compression
          )
        )

        logger.debug(s"Object ${state.storageObject.id} created into ${storageEngine.name} v${storageEngine.version}")

        if (isAvailable(out)) {
          emitStorageObject()
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
      state.output.write(buffer.toArray)

      // Update state
      state.hashDigest.update(buffer.toArray)
      state = state.copy(written = state.written + buffer.length)

      // Need more to read
      pull(in)
    }

    /**
      * Emit the file source. The source is emitted once the file is fully written
      */
    private def emitStorageObject(): Unit = {
      push(out, state.storageObject)
    }

  }

}

object StorageObjectWriter {

  private case class ObjectWriterState(
    written: Int,
    output: OutputStream,
    storageObject: StorageObject,
    hashDigest: MessageDigest
  )

  private object ObjectWriterState {
    def empty(implicit storageEngine: StorageEngine, ec: ExecutionContext): ObjectWriterState = {
      val storageObject = StorageObject(
        id = UUID.randomUUID(),
        size = 0,
        hash = "",
        storageSize = 0,
        storageHash = "",
        cipher = None,
        compression = None,
        storageEngine = storageEngine.name,
        storageEngineVersion = storageEngine.version,
        creation = LocalDateTime.now
      )

      // TODO handle failure
      // TODO add cipher and/or compression
      val output =  storageEngine.writeObject(storageObject.id)

      ObjectWriterState(0, output, storageObject, MessageDigest.getInstance("SHA1"))
    }
  }

  /**
    * Naïve version of the object writer, which assume the stream is not altered before. This stage will compute the
    * stage and the hash of the byte stream, and assume the this value are representative of the byte source.<br/>
    * <br/>
    * See
    * [[storage.StorageObjectWriter#apply(io.cumulus.persistence.storage.StorageEngine, akka.stream.scaladsl.Flow, scala.concurrent.ExecutionContext)]]
    * if a transformation is applied to the stream (compression, ..).
    *
    * @param storageEngine The storage engine to use
    * @see [[storage.StorageObjectWriter]]
    */
  def apply(storageEngine: StorageEngine)(implicit ec: ExecutionContext): StorageObjectWriter =
    new StorageObjectWriter(storageEngine)

  /**
    * Writer which takes an arbitrary transformation to apply to the byte stream before writing. This helper will
    * correctly set the size and hash before and after the transformation (`storageSize` and `storageHash`).
    *
    * @param storageEngine The storage engine to use
    * @param transformation The transformation to performs
    * @see [[storage.StorageObjectWriter]]
    */
  def apply(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed]
  )(implicit ec: ExecutionContext): Flow[ByteString, StorageObject, NotUsed] = {

    // Will write the byte stream to a file
    val objectWriter = StorageObjectWriter(storageEngine)

    // Will compute a SHA1 of the byte stream
    val sha1 = DigestCalculator.sha1

    // Will compute the total size of a byte stream
    val size = Counter.apply

    val graph = GraphDSL.create() { implicit builder =>
      val broadcast = builder.add(Broadcast[ByteString](3))
      val zip       = builder.add(ZipWith[StorageObject, Long, String, StorageObject] {
        case (storageObject, objectSize, objectSha1) =>
          storageObject.copy(
            hash = objectSha1,
            size = objectSize
          )
      })

      import GraphDSL.Implicits._

      // Compute the hash and size of the object while writing it
      broadcast ~> transformation ~> objectWriter ~> zip.in0
      broadcast ~> size                           ~> zip.in1
      broadcast ~> sha1                           ~> zip.in2

      FlowShape(broadcast.in, zip.out)
    }

    // Return the graph
    Flow[ByteString]
      .via(graph)
  }

}
