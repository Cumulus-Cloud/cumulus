package filesystem

import java.io.{File, FileInputStream, FileOutputStream}
import java.security.MessageDigest
import java.util.Base64

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{FileIO, Sink}
import models.FileChunk
import org.scalatest.BeforeAndAfterAll
import org.scalatestplus.play.{OneAppPerSuite, PlaySpec}
import play.api.Configuration
import play.api.inject.guice.GuiceApplicationBuilder
import storage.LocalStorageEngine
import utils.{FileJoiner, FileSplitter}

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Random

class LocalStorageEngineSpec extends PlaySpec with OneAppPerSuite with BeforeAndAfterAll {
  implicit override lazy val app = new GuiceApplicationBuilder()
    .configure(Map(
      "fileStorageEngine.LocalStorageEngine.path" -> "unitTestPath"
    )).build()

  import scala.concurrent.ExecutionContext.Implicits.global

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  val bufferSize = 1024
  val fileOf100ko = new File("100ko")
  val fileOf500ko = new File("500ko")
  val fileOf1Mo = new File("1Mo")

  val chunkOf1ko = 1024
  val chunkOf100ko = 102400
  val chunkLocation = new File("unitTestPath")

  val storageEngine = LocalStorageEngine(app.injector.instanceOf[Configuration])

  private def createTestFile(file: File, size: Int): File = {
    val writer = new FileOutputStream(file)

    0.to(size).by(bufferSize).fold(0)((written: Int, _: Int) => {
      val toWrite = new Array[Byte]((size - written).max(0).min(bufferSize))
      new Random().nextBytes(toWrite)
      writer.write(toWrite)

      written + bufferSize
    })

    writer.close()
    file
  }

  private def computeFileHash(file: File): String = {
    val reader = new FileInputStream(file)
    val digester = MessageDigest.getInstance("MD5")
    var read = 0
    val buffer = new Array[Byte](bufferSize)

    read = reader.read(buffer)
    while(read > 0) {
      digester.update(buffer, 0, read)
      read = reader.read(buffer)
    }
    reader.close()

    Base64.getEncoder.encodeToString(digester.digest)
  }

  override def beforeAll = {
    createTestFile(fileOf100ko, 102400)
    createTestFile(fileOf500ko, 512000)
    createTestFile(fileOf1Mo, 1048576)
    chunkLocation.mkdir
  }

  override def afterAll = {
    fileOf100ko.delete
    fileOf500ko.delete
    fileOf1Mo.delete
    chunkLocation.list.map(name => {
      new File(chunkLocation, name).delete
    })
    chunkLocation.delete
  }

  "File upload" should {
    "upload a file into a single chunk, with no integrity modification" in {
      val res = FileIO.fromPath(fileOf100ko.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .runWith(Sink.fold[Seq[FileChunk], FileChunk](Seq.empty[FileChunk])(_ :+ _)) // Return all the chunks at once
        .recover({
          case _ => Seq.empty // Will fail the test
        })

      val chunks = Await.result(res, 1000.millis)

      assert(chunks.size == 1)
      assert(chunks.head.hash == computeFileHash(fileOf100ko))
    }

    "upload a file into multiples chunks, with no integrity modification" in {
       val res = FileIO.fromPath(fileOf500ko.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .runWith(Sink.fold[Seq[FileChunk], FileChunk](Seq.empty[FileChunk])(_ :+ _)) // Return all the chunks at once
        .recover({
          case _ => Seq.empty // Will fail the test
        })

      val chunks = Await.result(res, 1000.millis)

      assert(chunks.size == 5)
    }

    "upload a file into multiples chunks, with correct MD5 hash for each chunks" in {
      val res = FileIO.fromPath(fileOf1Mo.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .runWith(Sink.fold[Seq[FileChunk], FileChunk](Seq.empty[FileChunk])(_ :+ _)) // Return all the chunks at once
        .recover({
        case _ => Seq.empty // Will fail the test
      })

      val chunks = Await.result(res, 1000.millis)

      chunks.foreach(chunk => {
        assert(chunk.hash == computeFileHash(new File(chunkLocation, chunk.id.toString)))
      })
    }
  }

  "File download" should {
    "work with a single-chunk file" in {
      val downloadFile = new File(chunkLocation, "unitTestFile1")
      val res = FileIO.fromPath(fileOf100ko.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .via(FileJoiner(storageEngine))
        .runWith(FileIO.toPath(downloadFile.toPath))

      Await.result(res, 100.millis)

      assert(computeFileHash(fileOf100ko) == computeFileHash(downloadFile))
    }

    "works with a multiple-chunks file" in {
      val downloadFile = new File(chunkLocation, "unitTestFile2")
      val res = FileIO.fromPath(fileOf500ko.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .via(FileJoiner(storageEngine))
        .runWith(FileIO.toPath(downloadFile.toPath))

      Await.result(res, 1000.millis)

      assert(computeFileHash(fileOf500ko) == computeFileHash(downloadFile))
    }

    "fails if the chunk length is not the same as the predicted one" in {
      val downloadFile = new File(chunkLocation, "notUsed")
      val res = FileIO.fromPath(fileOf100ko.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .map(chunk => chunk.copy(size = chunk.size - 1))
        .via(FileJoiner(storageEngine))
        .runWith(FileIO.toPath(downloadFile.toPath))

      assert(!Await.result(res, 1000.millis).wasSuccessful)
    }

    "fails if the chunk hash is not the same as the predicted one" in {
      val downloadFile = new File(chunkLocation, "notUsed")
      val res = FileIO.fromPath(fileOf100ko.toPath)
        .via(FileSplitter(storageEngine, chunkOf100ko))
        .map(chunk => chunk.copy(hash = chunk.hash + 'e'))
        .via(FileJoiner(storageEngine))
        .runWith(FileIO.toPath(downloadFile.toPath))

      assert(!Await.result(res, 1000.millis).wasSuccessful)
    }
  }

}
