package io.cumulus.i18n

import java.net.URL

import com.typesafe.config.ConfigFactory

import scala.collection.JavaConverters._


/** Defines a message provider, able to load all messages. */
trait MessagesProvider {

  def loadAllMessages(langs: Set[Lang]): Map[Lang, LangMessages] =
    langs
      .map { lang =>
        lang -> loadMessages(Some(lang))
      }.toMap ++ Map(
        Lang.default -> loadMessages(None)
      )

  protected def loadMessages(lang: Option[Lang]): LangMessages

}

/** HOCON implementation  */
class HoconMessagesProvider(messagesPrefix: Option[String] = Some("langs")) extends MessagesProvider {

  protected def loadMessages(lang: Option[Lang]): LangMessages =
    new LangMessages(lang.getOrElse(Lang.default), getMessages(getResource(lang.getOrElse(Lang.default))))

  private def getResource(lang: Lang): URL =
    Option(this.getClass.getClassLoader.getResource(joinPaths(messagesPrefix, s"messages.${lang.name}.conf")))
      .orElse(Option(this.getClass.getClassLoader.getResource(joinPaths(messagesPrefix, s"messages.${lang.language}.conf")))) match {
        case Some(value) =>
          value
        case None =>
          throw new Exception(s"Could not load message file for lang ${lang.name}")
      }

  private def joinPaths(first: Option[String], second: String): String =
    first match {
      case Some(parent) => new java.io.File(parent, second).getPath
      case None => second
    }

  private def getMessages(url: URL): Map[String, String] =
    ConfigFactory
      .parseURL(url)
      .resolve()
      .entrySet()
      .asScala
      .map(e => e.getKey -> String.valueOf(e.getValue.unwrapped()))
      .toMap

}

object HoconMessagesProvider {

  def at(path: String): HoconMessagesProvider =
    new HoconMessagesProvider(Some(path))

}