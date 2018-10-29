package io.cumulus.core.stream.utils

import java.security.MessageDigest

import akka.NotUsed
import akka.stream.scaladsl.Flow
import akka.stream.stage.{GraphStage, GraphStageLogic, InHandler, OutHandler}
import akka.stream.{Attributes, FlowShape, Inlet, Outlet}
import akka.util.ByteString
import io.cumulus.core.utils.Base64

/**
  * Compute the digest of the provided stream.
  *
  * @param algorithm The algorithm to use
  */
class DigestCalculator(algorithm: String) extends GraphStage[FlowShape[ByteString, String]] {

  private val in: Inlet[ByteString] = Inlet[ByteString]("DigestCalculator.in")
  private val out: Outlet[String]   = Outlet[String]("DigestCalculator.out")

  override val shape: FlowShape[ByteString, String] = FlowShape.of(in, out)

  override def createLogic(inheritedAttributes: Attributes): GraphStageLogic = new GraphStageLogic(shape) {
    val digest: MessageDigest = MessageDigest.getInstance(algorithm)

    setHandler(out, new OutHandler {
      override def onPull(): Unit = {
        pull(in)
      }
    })

    setHandler(in, new InHandler {
      override def onPush(): Unit = {
        val chunk = grab(in)
        digest.update(chunk.toArray)
        pull(in)
      }

      override def onUpstreamFinish(): Unit = {
        emit(out, Base64.encode(digest.digest()))
        completeStage()
      }
    })

  }
}

object DigestCalculator {

  def apply(algorithm: String): DigestCalculator =
    new DigestCalculator(algorithm)

  /**
    * Compute the MD5 hash of the stream.
    */
  def md5: Flow[ByteString, String, NotUsed] =
    Flow[ByteString].via(DigestCalculator("MD5"))

  /**
    * Compute the SHA-1 hash of the stream.
    */
  def sha1: Flow[ByteString, String, NotUsed] =
    Flow[ByteString].via(DigestCalculator("SHA-1"))

  /**
    * Compute the SHA-256 hash of the stream.
    */
  def sha256: Flow[ByteString, String, NotUsed] =
    Flow[ByteString].via(DigestCalculator("SHA-256"))

}
