package io.cumulus.controllers.app.views

import io.cumulus.i18n.{Lang, Messages}
import play.api.libs.json.Writes
import scalatags.Text.all._


/**
  * Base for HTML view of the application.
  */
trait View {

  def content: Frag

}

object View {

  // TODO resulting here ?

}
