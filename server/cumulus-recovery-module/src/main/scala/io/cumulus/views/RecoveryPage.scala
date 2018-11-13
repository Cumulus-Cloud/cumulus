package io.cumulus.views

import play.api.i18n.Messages
import play.api.libs.json.{JsArray, JsNull, JsValue, Json}

case class RecoveryPage(
  error: Throwable
)(implicit
  val messages: Messages
) extends IndexTemplate {

  override protected def info: Map[String, JsValue] = {
    Map(
      "user" -> JsNull,
      "directoryWithContent" -> JsNull,
      "error" -> Json.obj(
        "stack" -> JsArray(
          error.getStackTrace.toList.map { trace =>
            Json.obj(
              "object" -> trace.getClassName,
              "func" -> trace.getMethodName,
              "line" -> trace.getLineNumber
            )
          }
        )
      )
    )
  }

}
