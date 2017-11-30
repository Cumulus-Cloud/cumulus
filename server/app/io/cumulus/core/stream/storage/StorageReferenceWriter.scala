package io.cumulus.core.stream.storage

import scala.concurrent.{ExecutionContext, Future}

import akka.stream.FlowShape
import akka.stream.scaladsl.GraphDSL.Implicits._
import akka.stream.scaladsl.{Broadcast, Flow, GraphDSL, Sink, ZipWith}
import akka.util.ByteString
import io.cumulus.core.Settings
import io.cumulus.core.stream.utils.{Chunker, Counter, DigestCalculator}
import io.cumulus.core.utils.MimeType
import io.cumulus.models.fs.File
import io.cumulus.models.{Path, UserSession}
import io.cumulus.persistence.storage.{StorageEngine, StorageObject, StorageReference}
import io.cumulus.stages.{CipherStage, CompressionStage}

object StorageReferenceWriter {

  def apply(
    storageEngine: StorageEngine,
    cipher: Option[CipherStage],
    compression: Option[CompressionStage],
    path: Path
  )(implicit user: UserSession, settings: Settings, ec: ExecutionContext): Sink[ByteString, Future[File]] = {

    val (privateKey, salt) =  user.privateKeyAndSalt

    // Create the transformation
    val transformation =
      Flow[ByteString]
        .via(compression.map(_.compress).getOrElse(Flow[ByteString]))
        .via(cipher.map(_.encrypt(privateKey, salt)).getOrElse(Flow[ByteString]))

    // Split the incoming stream of bytes, and writes it to multiple files
    val objectsWriter =
      Chunker.splitter(settings.storage.objectSize, settings.storage.chunkSize)
        .via(StorageObjectWriter(storageEngine, transformation))
        .mergeSubstreams

    // Will compute a SHA1 of the byte stream
    val sha1 = DigestCalculator.sha1

    // Will compute the total size of a byte stream
    val size = Counter.apply

    // Group all the uploaded files
    val groupObjects = Flow[StorageObject].fold(Seq.empty[StorageObject])((storageObjects, storageObject) => storageObjects :+ storageObject)

    val graph = GraphDSL.create() { implicit builder =>
      val broadcast = builder.add(Broadcast[ByteString](3))
      val zip       = builder.add(ZipWith[Seq[StorageObject], Long, String, File] {
        case (storageObjects, fileSize, fileSha1) =>
          val storageRef = StorageReference(
            size = fileSize,
            hash = fileSha1,
            cipher = cipher.map(_.name),
            compression = compression.map(_.name),
            storage = storageObjects
          )

          // Create the file with the provided information
          File.create(
            path = path,
            owner = user.id,
            mimeType = MimeType.detect(path.name),
            storage = storageRef
          )
      })

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
