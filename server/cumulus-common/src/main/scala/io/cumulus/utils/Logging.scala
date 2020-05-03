package io.cumulus.utils

import com.typesafe.scalalogging.Logger


/**
  * Provides logging capability for the implementing class.
  */
trait Logging {

  /** Logger, using the name of the class/object */
  val logger: Logger = {
    val name = this.getClass.getName.stripSuffix("$")
    Logger(name)
  }

}
