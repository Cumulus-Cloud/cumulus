package io.cumulus.utils

import enumeratum.EnumEntry
import play.api.libs.json._

object Enum {

  def enumReader[E <: EnumEntry](path: String)(implicit reads: Reads[E]): Reads[E] =
    (json: JsValue) => {
      (json \ path)
        .validateOpt[E]
        .flatMap(v => v.map(JsSuccess(_)).getOrElse(JsError(__ \ "operation", "error.path.missing")))
    }

}
