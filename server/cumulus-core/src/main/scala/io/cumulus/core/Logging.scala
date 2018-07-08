package io.cumulus.core

import play.api.Logger

/**
  * Provides logging capability for the implementing class.
  */
trait Logging {

  /** Logger, using the name of the class/object */
  val logger: Logger = {
    val name = this.getClass.getName.stripSuffix("$")
    play.api.Logger(name)
  }

}
