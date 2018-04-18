package io.cumulus.core

/**
  * Provides logging capability for the implementing class.
  */
trait Logging {

  /** Logger, using the name of the class/object */
  val logger = {
    val name = this.getClass.getName.stripSuffix("$")
    play.api.Logger(name)
  }

}
