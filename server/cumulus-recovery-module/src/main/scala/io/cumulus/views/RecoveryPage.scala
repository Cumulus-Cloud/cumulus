package io.cumulus.views

import play.api.i18n.Messages
import play.api.libs.json.{JsArray, JsNull, JsValue, Json}

import scala.annotation.tailrec

case class RecoveryPage(
  error: Throwable
)(implicit
  val messages: Messages
) extends IndexTemplate {


  private def getAllErrorCauses(error: Throwable): Seq[Throwable] = {
    @tailrec
    def accumulator(acc: Seq[Throwable], next: Option[Throwable]): Seq[Throwable] =
      next match {
        case None =>
          acc
        case Some(t) =>
          accumulator(acc :+ t, Option(t.getCause))
      }

    accumulator(Seq.empty, Some(error))
  }


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
