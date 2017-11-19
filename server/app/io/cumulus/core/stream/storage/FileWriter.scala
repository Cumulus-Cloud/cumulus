package io.cumulus.core.stream.storage

import scala.concurrent.{ExecutionContext, Future}

import akka.NotUsed
import akka.stream.FlowShape
import akka.stream.scaladsl.{Broadcast, Flow, GraphDSL, Sink, ZipWith}
import akka.util.ByteString
import io.cumulus.core.stream.utils.{Chunker, Counter, DigestCalculator}
import io.cumulus.core.utils.MimeType
import io.cumulus.models.fs.File
import io.cumulus.models.{Path, User}
import io.cumulus.persistence.storage.{StorageEngine, StorageObject}

object FileWriter {

  def apply(
    storageEngine: StorageEngine,
    transformation: Flow[ByteString, ByteString, NotUsed],
    path: Path,
    objectSize: Int,
    chunkSize: Int
  )(implicit user: User, ec: ExecutionContext): Sink[ByteString, Future[File]] = {

    // Split the incoming stream of bytes, and writes it to multiple files
    val objectsWriter =
      Chunker.splitter(objectSize, chunkSize)
        .via(ObjectWriter(storageEngine, transformation))
        .mergeSubstreams

    // Will compute a SHA1 of the byte stream
    val sha1 = DigestCalculator.sha1

    // Will compute the total size of a byte stream
    val size = Counter.apply

    // Group all the uploaded files
    val groupObjects = Flow[StorageObject].fold(Seq.empty[StorageObject])((storageObjects, storageObject) => storageObjects :+ storageObject)

    val graph = GraphDSL.create() { implicit builder =>
      val broadcast = builder.add(Broadcast[ByteString](3))
      val zip       = builder.add(ZipWith[Seq[StorageObject], Int, String, File] {
        case (storageObjects, fileSize, fileSha1) =>
          // Create the file with the provided information
          File(
            path = path,
            owner = user.id
          ).copy(
            size = fileSize,
            hash = fileSha1,
            mimeType = MimeType.detect(path.name),
            storage = storageObjects
          )
      })

      import GraphDSL.Implicits._

      // Compute the size and hash of the file while writing it using the provided storage engine
      broadcast ~> objectsWriter ~> groupObjects ~> zip.in0
      broadcast ~> size                          ~> zip.in1
      broadcast ~> sha1                          ~> zip.in2

      FlowShape(broadcast.in, zip.out)
    }

    Flow[ByteString]
      .via(graph)
      .toMat(Sink.head)((_, file) => file)
  }

}
