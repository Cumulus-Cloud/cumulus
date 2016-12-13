package utils

import play.api.Logger

trait Log {
  val logger = Logger(this.getClass)
}
