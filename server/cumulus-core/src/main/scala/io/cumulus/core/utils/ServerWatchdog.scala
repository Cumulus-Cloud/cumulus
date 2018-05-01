package io.cumulus.core.utils

/**
  * Common trait for the server watchdog.
  */
trait ServerWatchdog {

  /** Start the main server. Should have no effect if the server is already started. */
  def start(): Unit

  /** Stop the server and the scala application. */
  def stop(): Unit

  /** Reload the server. */
  def reload(): Unit

}
