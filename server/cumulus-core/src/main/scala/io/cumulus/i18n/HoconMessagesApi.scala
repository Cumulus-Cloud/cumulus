package io.cumulus.i18n


import java.net.URL
import java.util.Properties

import com.typesafe.config.ConfigFactory
import play.api.http.HttpConfiguration
import play.api.i18n._
import play.api.{Configuration, Environment}
import play.utils.Resources

import scala.collection.JavaConverters._


class HoconMessagesApiProvider(
  environment: Environment,
  config: Configuration,
  langs: Langs,
  httpConfiguration: HttpConfiguration
) extends DefaultMessagesApiProvider(environment, config, langs, httpConfiguration) {

  override lazy val get: MessagesApi = {
    new DefaultMessagesApi(
      loadAllMessages,
      langs,
      langCookieName = langCookieName,
      langCookieSecure = langCookieSecure,
      langCookieHttpOnly = langCookieHttpOnly,
      httpConfiguration = httpConfiguration
    )
  }

  override protected def loadMessages(file: String): Map[String, String] = {
    getResources(file)
      .filterNot(url => Resources.isDirectory(environment.classLoader, url)).reverse
      .map(getMessages)
      .foldLeft(Map.empty[String, String]) { _ ++ _ }
  }

  override protected def loadAllMessages: Map[String, Map[String, String]] = {
    langs.availables.map(_.code).map { lang =>
      (lang, loadMessages(s"messages.$lang.conf"))
    }.toMap ++ Map(
      "default" -> loadMessages("messages.conf"),
      "default.play" -> loadMessages("messages.default")
    )
  }

  override protected def joinPaths(first: Option[String], second: String): String = first match {
    case Some(parent) => new java.io.File(parent, second).getPath
    case None => second
  }

  private def getResources(file: String): List[URL] = {
    environment.classLoader.getResources(joinPaths(messagesPrefix, file)).asScala.toList
  }

  private def getMessages(url: URL): Map[String, String] = {
    // messages.default is bundled with play and it is a properties file
    val config = if (url.toString.endsWith("messages.default")) {
      ConfigFactory.parseProperties(getProperties(url))
    } else {
      ConfigFactory.parseURL(url)
    }

    config.resolve().entrySet().asScala
      .map(e => e.getKey -> String.valueOf(e.getValue.unwrapped()))
      .toMap
  }

  private def getProperties(url: URL): Properties = {
    val properties = new Properties()
    val input = url.openStream()
    try {
      properties.load(input)
    } finally {
      input.close()
    }
    properties
  }
}


/**
  * Components for Compile Time Dependency Injection.
  */
trait HoconI18nComponents extends I18nComponents {

  def environment: Environment
  def configuration: Configuration
  def httpConfiguration: HttpConfiguration
  def langs: Langs

  override lazy val messagesApi: MessagesApi = new HoconMessagesApiProvider(environment, configuration, langs, httpConfiguration).get
}
