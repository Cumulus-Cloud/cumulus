package io.cumulus

import java.net.{URI, URL}

import com.typesafe.config.{Config, ConfigValue}

import scala.collection.JavaConverters._
import scala.concurrent.duration.{Duration, FiniteDuration}

class Configuration(underlying: Config) {

  def ++(other: Configuration): Configuration =
    new Configuration(other.underlying.withFallback(underlying))

  /**
   * Check if the given path exists.
   */
  def has(path: String): Boolean =
    underlying.hasPath(path)

  /**
   * Get the config at the given path.
   */
  def get[A](path: String)(implicit loader: ConfigLoader[A]): A = {
    loader.load(underlying, path)
  }
  def subKeys: Set[String] =
    underlying.root().keySet().asScala.toSet

  /**
   * Returns every path as a set of key to value pairs, by recursively iterating through the
   * config objects.
   */
  def entrySet: Set[(String, ConfigValue)] =
    underlying.entrySet().asScala.map(e => e.getKey -> e.getValue).toSet

}

object Configuration {

  def apply(underlying: Config): Configuration =
    new Configuration(underlying)

}


/**
 * A config loader
 */
trait ConfigLoader[A] { self =>

  def load(config: Config, path: String = ""): A

  def map[B](f: A => B): ConfigLoader[B] =
    (config: Config, path: String) => f(self.load(config, path))

}

object ConfigLoader {

  def apply[A](f: Config => String => A): ConfigLoader[A] =
    (config: Config, path: String) => f(config)(path)

  implicit val stringLoader: ConfigLoader[String]         = ConfigLoader(_.getString)
  implicit val seqStringLoader: ConfigLoader[Seq[String]] = ConfigLoader(_.getStringList).map(_.asScala.toSeq)

  implicit val intLoader: ConfigLoader[Int]         = ConfigLoader(_.getInt)
  implicit val seqIntLoader: ConfigLoader[Seq[Int]] = ConfigLoader(_.getIntList).map(_.asScala.map(_.toInt).toSeq)

  implicit val booleanLoader: ConfigLoader[Boolean]         = ConfigLoader(_.getBoolean)
  implicit val seqBooleanLoader: ConfigLoader[Seq[Boolean]] = ConfigLoader(_.getBooleanList).map(_.asScala.map(_.booleanValue).toSeq)

  implicit val finiteDurationLoader: ConfigLoader[FiniteDuration]         = ConfigLoader(_.getDuration).map(javaDurationToScala)
  implicit val seqFiniteDurationLoader: ConfigLoader[Seq[FiniteDuration]] = ConfigLoader(_.getDurationList).map(_.asScala.map(javaDurationToScala).toSeq)

  implicit val durationLoader: ConfigLoader[Duration] = ConfigLoader { config => path =>
    if (config.getIsNull(path)) Duration.Inf
    else if (config.getString(path) == "infinite") Duration.Inf
    else finiteDurationLoader.load(config, path)
  }
  implicit val seqDurationLoader: ConfigLoader[Seq[Duration]] = seqFiniteDurationLoader.map(identity[Seq[Duration]])

  implicit val doubleLoader: ConfigLoader[Double]         = ConfigLoader(_.getDouble)
  implicit val seqDoubleLoader: ConfigLoader[Seq[Double]] = ConfigLoader(_.getDoubleList).map(_.asScala.map(_.doubleValue).toSeq)

  implicit val numberLoader: ConfigLoader[Number]         = ConfigLoader(_.getNumber)
  implicit val seqNumberLoader: ConfigLoader[Seq[Number]] = ConfigLoader(_.getNumberList).map(_.asScala.toSeq)

  implicit val longLoader: ConfigLoader[Long]         = ConfigLoader(_.getLong)
  implicit val seqLongLoader: ConfigLoader[Seq[Long]] = ConfigLoader(_.getLongList).map(_.asScala.map(_.longValue).toSeq)

  implicit val configLoader: ConfigLoader[Config]         = ConfigLoader(_.getConfig)
  implicit val seqConfigLoader: ConfigLoader[Seq[Config]] = ConfigLoader(_.getConfigList).map(_.asScala.toSeq)

  implicit val configurationLoader: ConfigLoader[Configuration]         = ConfigLoader(c => s => Configuration(c.getConfig(s)))
  implicit val seqConfigurationLoader: ConfigLoader[Seq[Configuration]] = ConfigLoader(_.getConfigList).map(_.asScala.map(Configuration(_)))

  implicit val urlLoader: ConfigLoader[URL] = ConfigLoader(_.getString).map(new URL(_))
  implicit val uriLoader: ConfigLoader[URI] = ConfigLoader(_.getString).map(new URI(_))

  private def javaDurationToScala(javaDuration: java.time.Duration): FiniteDuration =
    Duration.fromNanos(javaDuration.toNanos)

  Configuration

  /**
   * Loads a value, interpreting a null value as None and any other value as Some(value).
   */
  implicit def optionLoader[A](implicit valueLoader: ConfigLoader[A]): ConfigLoader[Option[A]] =
    (config: Config, path: String) => {
      if (config.getIsNull(path))
        None
      else
        Some(valueLoader.load(config, path))
    }

  implicit def mapLoader[A](implicit valueLoader: ConfigLoader[A]): ConfigLoader[Map[String, A]] =
    (config: Config, path: String) => {
      val obj = config.getObject(path)
      val conf = obj.toConfig

      obj
        .keySet()
        .asScala
        .iterator
        .map(_ -> valueLoader.load(conf, path))
        .toMap
    }

}
