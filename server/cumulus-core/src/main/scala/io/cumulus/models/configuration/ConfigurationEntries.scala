package io.cumulus.models.configuration

import play.api.Configuration

/**
  * Abstract configuration entries that can me merged with Play's configuration file.
  */
trait ConfigurationEntries {

  def toPlayConfiguration: Configuration

}

trait ConfigurationEntriesFactory[T <: ConfigurationEntries] {

  def fromPlayConfiguration(configuration: Configuration): T

}