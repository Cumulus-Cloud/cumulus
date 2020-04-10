package io.cumulus.i18n

import java.util.Locale


case class Lang(locale: Locale) {

  def language: String =
    locale.getLanguage

  def country: String =
    locale.getCountry

  def name: String =
    (language, locale.getCountry) match {
      case (language, "") => language
      case (language, country) => s"${language}_$country"
    }

}

object Lang {

  val default: Lang =
    Lang(Locale.getDefault)

  def apply(language: String): Lang =
    Lang(new Locale(language))

  def apply(maybeLang: Option[String], default: Lang = default): Lang =
    maybeLang.map(apply) getOrElse default

}
