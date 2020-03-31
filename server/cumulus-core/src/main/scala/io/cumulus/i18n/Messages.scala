package io.cumulus.i18n

import java.text.MessageFormat


/** All the messages for a lang. */
class LangMessages(val lang: Lang, val messages: Map[String, String]) {

  /** get the message w/o formatting. */
  def raw(messageKey: String): String =
    messages.getOrElse(messageKey, messageKey) // If no message is found, return the key itself

  /** get the message with formatting. */
  def apply(key: String, args: Any*): String =
    new MessageFormat(raw(key), lang.locale).format(args.map(_.asInstanceOf[java.lang.Object]).toArray)

}

object LangMessages {

  def empty: LangMessages =
    new LangMessages(Lang.default, Map.empty)

}

/** All the messages for all the lang. This is the main class to be injected. */
class Messages(val preferredLocale: Lang, val locales: Seq[Lang], provider: MessagesProvider) {

  private val messages: Map[Lang, LangMessages] =
    provider.loadAllMessages(preferredLocale +: locales)

  def messagesForLang(lang: Lang): LangMessages =
    messages
      .get(lang)
      .orElse(messages.get(Lang.default)) // Default to default jvm lang
      .getOrElse(LangMessages.empty)


  /** get the message w/o formatting. */
  def raw(messageKey: String)(implicit lang: Lang): String =
    messagesForLang(lang)
      .raw(messageKey)

  /** get the message with formatting. */
  def apply(messageKey: String, args: Any*)(implicit lang: Lang): String =
    new MessageFormat(raw(messageKey), lang.locale).format(args.map(_.asInstanceOf[java.lang.Object]).toArray)

}
