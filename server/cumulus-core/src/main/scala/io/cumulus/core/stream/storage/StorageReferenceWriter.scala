package io.cumulus.core.stream.storage

import scala.concurrent.{ExecutionContext, Future}
import akka.stream.FlowShape
import akka.stream.scaladsl.GraphDSL.Implicits._
import akka.stream.scaladsl.{Broadcast, Flow, GraphDSL, Sink, ZipWith}
import akka.util.ByteString
import io.cumulus.core.Settings
import io.cumulus.core.stream.utils.{Chunker, Counter, DigestCalculator}
import io.cumulus.core.utils.MimeType
import io.cumulus.core.validation.AppError
import io.cumulus.models.fs.File
import io.cumulus.models.Path
import io.cumulus.models.user.session.UserSession
import io.cumulus.persistence.storage.{StorageCipher, StorageEngine, StorageObject, StorageReference}
import io.cumulus.stages.{CipherStage, CompressionStage}

object StorageReferenceWriter {

  /**
    * Returns a sink allowing to write a stream of bytes into the provided storage engine. The sink will output a
    * file containing the storage references.
    *
    * @param storageEngine The storage engine to use.
    * @param cipher The optional cipher used to encrypt the byte stream.
    * @param compression The optional compression algorithm used to compress the byte stream.
    * @param path The path of the create file.
    */
  def writer(
    storageEngine: StorageEngine,
    cipher: Option[CipherStage],
    compression: Option[CompressionStage],
    path: Path
  )(implicit user: UserSession, settings: Settings, ec: ExecutionContext): Either[AppError, Sink[ByteString, Future[File]]] = {

    // Get the cipher & compression stage
    val (storageCipher, cipherStage) = cipherForFile(cipher)
    val compressionStage             = compressionForFile(compression)

    // Create the transformation
    val transformation =
      Flow[ByteString]
        .via(compressionStage)
        .via(cipherStage)

    // Split the incoming stream of bytes, and writes it to multiple files
    val objectsWriter =
      Chunker.splitter(settings.storage.objectSize, settings.storage.chunkSize)
        .via(StorageObjectWriter.writer(storageEngine, transformation))
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
          // Create the file with the provided information
          File.create(
            creator = user,
            path = path,
            mimeType = MimeType.detect(path.name),
            storage = StorageReference.create(
              size = fileSize,
              hash = fileSha1,
              cipher = storageCipher,
              compression = compression.map(_.name),
              storage = storageObjects
            )
          )
      })

      // Compute the size and hash of the file while writing it using the provided storage engine
      broadcast ~> objectsWriter ~> groupObjects ~> zip.in0
      broadcast ~> size                          ~> zip.in1
      broadcast ~> sha1                          ~> zip.in2

      FlowShape(broadcast.in, zip.out)
    }

    Right(
      Flow[ByteString]
        .via(graph)
        .toMat(Sink.head)((_, file) => file)
    )
  }

  /** Get the compression used to compress the file. */
  private def compressionForFile(maybeCompression: Option[CompressionStage]) =
    maybeCompression.map(_.compress).getOrElse(Flow[ByteString])

  /** Get the cipher to crypt the file. */
  private def cipherForFile(maybeCipher: Option[CipherStage])(implicit session: UserSession) =
    maybeCipher.map { cipherStage =>

      // Retrieve the user's global private key
      val privateGlobalKey = session.privateKey

      // Generate the file's own private key & get the cipher stage
      val cipher     = StorageCipher.create(cipherStage.name, privateGlobalKey)
      val cipherFlow = cipherStage.encrypt(cipher.privateKey(privateGlobalKey), cipher.salt)

      (Some(cipher), cipherFlow)
    }
      .getOrElse((None, Flow[ByteString]))

}
