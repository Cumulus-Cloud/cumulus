package io.cumulus.core.utils

/**
  * A range.
  * @param start The start of the range.
  * @param end The end of the range.
  */
sealed case class Range(start: Long, end: Long)
