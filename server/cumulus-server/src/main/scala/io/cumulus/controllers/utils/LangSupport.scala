package io.cumulus.controllers.utils

import akka.http.scaladsl.model.headers.Language
import akka.http.scaladsl.server.Directive1
import akka.http.scaladsl.server.Directives.selectPreferredLanguage
import io.cumulus.i18n.{Lang, Messages}


trait LangSupport {

  val m: Messages

  def extractLang(messages: Messages): Directive1[Lang] =
    selectPreferredLanguage(Language(m.preferredLocale.name), m.locales.map(l => Language(l.name)):_*)
      .map(l => Lang(l.primaryTag)) // Convert to our own type

}
