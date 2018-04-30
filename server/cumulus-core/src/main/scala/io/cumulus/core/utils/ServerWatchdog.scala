package io.cumulus.core.utils

trait ServerWatchdog {

  def start(): Unit

  def stop(): Unit

  def reload(): Unit

}
