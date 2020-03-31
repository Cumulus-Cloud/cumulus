package io.cumulus.stream.storage

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
import io.cumulus.stream.storage.StorageObjectWriter.ObjectWriterState
import io.cumulus.stream.utils.{Counter, DigestCalculator}
import io.cumulus.utils.{Base64, Logging}
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}


/**
  * Object writer (Flow of `ByteString` to `StorageObject`) which will write to a newly created storage object the
  * content of the stream using the provided storage engine.
  * @param storageEngine The storage engine to use.
  */
class StorageObjectWriter(storageEngine: StorageEngine)(implicit ec: ExecutionContext) extends GraphStage[FlowShape[ByteString, StorageObject]] with Logging {

  private val in: Inlet[ByteString]      = Inlet[ByteString]("ObjectWriter.in")
  private val out: Outlet[StorageObject] = Outlet[StorageObject]("ObjectWriter.out")

  override val shape: FlowShape[ByteString, StorageObject] = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {

    // The storage engine used
    private implicit val engine: StorageEngine = storageEngine

    // The current state
    @SuppressWarnings(Array("org.wartremover.warts.Var"))
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
      * Write a buffer to a file source.
      * @param buffer The buffer to write.
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
      * Emit the file source. The source is emitted once the file is fully written.
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
        storageEngineReference = storageEngine.reference,
        creation = LocalDateTime.now
      )

      // TODO handle failure ?
      val output =  storageEngine.writeObject(storageObject.id)

      ObjectWriterState(0, output, storageObject, MessageDigest.getInstance("SHA1"))
    }
  }

  /**
    * Naïve version of the object writer, which assume the stream is not altered before. This stage will compute the
    * stage and the hash of the byte stream, and assume that this value are representative of the byte source.
 *
    * @param storageEngine The storage engine to use.
    * @see [[io.cumulus.stream.storage.StorageObjectWriter StorageObjectWriter]]
    */
  def writer(
    storageEngine: StorageEngine
  )(implicit ec: ExecutionContext): Flow[ByteString, StorageObject, NotUsed] =
    Flow[ByteString].via(new StorageObjectWriter(storageEngine))

  /**
    * Object writer (Flow of `ByteString` to `StorageObject`) which will write to a newly created storage object the
    * content of the stream using the provided storage engine. An optional transformation to apply to the byte stream
    * before writing can be provided (i.e. for compression or encryption).
    * <br/><br/>
    * This helper will correctly set the size and hash before and after the transformation (`storageSize` and
    * `storageHash`).
    * <br/><br/>
    * This flow aims at being used with substreams to allow to upload multiples chunks without ending the stream.
 *
    * @param storageEngine The storage engine to use.
    * @param transformation The transformation to performs.
    * @see [[io.cumulus.stream.storage.StorageObjectWriter StorageObjectWriter]]
    */
  def writer(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed]
  )(implicit ec: ExecutionContext): Flow[ByteString, StorageObject, NotUsed] = {

    // Will write the byte stream using the provided storage engine, and return the storage object
    val objectWriter = new StorageObjectWriter(storageEngine)

    // Will compute the hash (SHA1) of a byte stream
    val hash = DigestCalculator.sha1

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
      broadcast ~> hash                           ~> zip.in2

      FlowShape(broadcast.in, zip.out)
    }

    // Return the graph
    Flow[ByteString]
      .via(graph)
  }

}
