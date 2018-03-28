package io.cumulus.core.stream.storage

import scala.concurrent.ExecutionContext

import akka.NotUsed
import akka.stream._
import akka.stream.scaladsl.{Broadcast, Flow, GraphDSL, Source, ZipWith}
import akka.util.ByteString
import io.cumulus.core.stream.utils.FlowExtensions._
import io.cumulus.core.stream.utils.SinkExtensions._
import io.cumulus.core.stream.utils.{Counter, DigestCalculator}
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}

/**
  * @see [[io.cumulus.core.stream.storage.StorageObjectWriter#apply StorageObjectWriter.writer]]
  */
object StorageObjectWriter {

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
    * @param storageEngine The storage engine to use
    * @param transformation The transformation to performs (default to no transformation)
    */
  def writer(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed] = Flow[ByteString]
  )(implicit ec: ExecutionContext): Flow[ByteString, StorageObject, NotUsed] = {

    // Will write the byte stream using the provided storage engine, and return the storage object
    val write: Flow[ByteString, StorageObject, _] =
      Flow[ByteString].flatMap { firstBytes =>
        // Empty storage object generated
        val storageObject = StorageObject.create(storageEngine)

        // Sink generated from the storage engine
        val sink = storageEngine.getObjectWriter(storageObject.id)

        Flow[ByteString]
          .prepend(Source(List(firstBytes)))
          .to(sink)
          .toFlow
          .map(_ => storageObject)
      }

    // Will compute the hash (SHA1) of a byte stream
    val hash = DigestCalculator.sha1

    // Will compute the total size of a byte stream
    val size = Counter.apply

    // Compute the hash and size of the object while writing it (before and after the transformation)
    val graph = GraphDSL.create() { implicit builder =>
      val broadcast            = builder.add(Broadcast[ByteString](3))
      val broadcastTransformed = builder.add(Broadcast[ByteString](3))

      val zip = builder.add(ZipWith[StorageObject, Long, String, Long, String, StorageObject] {
        case (storageObject, storageSize, storageHash, chunkSize, chunkHash) =>
          storageObject.copy(
            hash = chunkHash,
            size = chunkSize,
            storageHash = storageHash,
            storageSize = storageSize
          )
      })

      import GraphDSL.Implicits._

      broadcast ~> transformation ~> broadcastTransformed ~> write ~> zip.in0
                                     broadcastTransformed ~> size  ~> zip.in1
                                     broadcastTransformed ~> hash  ~> zip.in2
      broadcast ~> size                                            ~> zip.in3
      broadcast ~> hash                                            ~> zip.in4

      FlowShape(broadcast.in, zip.out)
    }

    // Return the graph
    Flow[ByteString].via(graph)
  }

}
