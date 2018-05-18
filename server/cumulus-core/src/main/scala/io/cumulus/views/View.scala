package io.cumulus.views

import play.api.http.{ContentTypeOf, ContentTypes, Writeable}
import play.api.mvc.Codec
import scalatags.Text.all._

/**
  * Base for HTML view of the application.
  */
trait View {

  def content: Frag

}

object View {

  implicit def writeableTag(implicit codec: Codec): Writeable[View] = {
    Writeable(tag => codec.encode("<!DOCTYPE html>\n" + tag.content.render))
  }

  implicit def contentTypeOfTag(implicit codec: Codec): ContentTypeOf[View] = {
    ContentTypeOf[View](Some(ContentTypes.HTML))
  }

}
