package io.cumulus.views

import play.api.i18n.Messages
import play.api.libs.json.{JsArray, JsNull, JsValue, Json}

case class RecoveryPage(
  error: Throwable
)(implicit
  val messages: Messages
) extends IndexTemplate {


  private def getAllErrorCauses(error: Throwable): Seq[Throwable] =
    Seq(error) ++ Option(error.getCause).map(getAllErrorCauses).getOrElse(Seq.empty)

  override protected def info: Map[String, JsValue] = {
    Map(
      "user" -> JsNull,
      "directoryWithContent" -> JsNull,
      "error" -> Json.obj(
        "causes" -> getAllErrorCauses(error).map { e =>
          Json.obj(
            "type" -> e.getClass.toString,
            "message" -> Option(e.getMessage).getOrElse("No error message provided").toString,
            "stack" -> JsArray(
              e.getStackTrace.toList.map { trace =>
                Json.obj(
                  "object" -> trace.getClassName,
                  "func" -> trace.getMethodName,
                  "line" -> trace.getLineNumber
                )
              }
            )
          )
        }
      )
    )
  }

}
