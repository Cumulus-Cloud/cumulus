package io.cumulus.views

import io.cumulus.Settings
import io.cumulus.i18n.{Lang, Messages}


/**
  * Base for HTML view of the application.
  */
trait View {

  protected implicit def settings: Settings
  protected implicit def messages: Messages

  def render(implicit l: Lang): String

}
