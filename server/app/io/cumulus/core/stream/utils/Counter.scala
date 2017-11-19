package io.cumulus.core.stream.utils

import akka.NotUsed
import akka.stream.scaladsl.Flow
import akka.util.ByteString

object Counter {

  /**
    * Count the number of bytes of a stream.
    */
  def apply: Flow[ByteString, Int, NotUsed] =
    Flow[ByteString].fold(0)((size, bytes) => size + bytes.size)

}