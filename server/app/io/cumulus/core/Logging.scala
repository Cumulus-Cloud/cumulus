package io.cumulus.core

trait Logging {
  val logger = {
    val name = this.getClass.getName.stripSuffix("$")
    play.api.Logger(name)
  }
}
