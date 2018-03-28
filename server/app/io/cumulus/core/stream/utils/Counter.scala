package io.cumulus.core.stream.utils

import akka.NotUsed
import akka.stream.scaladsl.Flow
import akka.util.ByteString

/**
  * @see [[io.cumulus.core.stream.utils.Counter#apply Counter.apply]]
  */
object Counter {

  /**
    * Count the number of bytes of a stream.
    */
  def apply: Flow[ByteString, Long, NotUsed] =
    Flow[ByteString].fold(0l)((size, bytes) => size + bytes.size)

}