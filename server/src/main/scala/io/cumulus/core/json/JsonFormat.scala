package io.cumulus.core.json

import java.util.UUID
import scala.util.Try

import akka.util.ByteString
import cats.data.NonEmptyList
import io.cumulus.core.utils.Base64
import play.api.libs.json._

object JsonFormat {

  /**
    * UUID JSON format.
    */
  implicit val uuidFormat: Format[UUID] = new Format[UUID] {

    override def reads(json: JsValue): JsResult[UUID] =
      Json.fromJson[String](json).flatMap { s =>
        Try(java.util.UUID.fromString(s)).toEither match {
          case Right(uuid) => JsSuccess(uuid)
          case _           => JsError("Invalid UUID")
        }
      }

    override def writes(o: UUID): JsValue =
      JsString(o.toString)

  }

  implicit def uuidMapFormat[V](implicit format: Format[V]): Format[Map[UUID, V]] = new Format[Map[UUID, V]] {

    override def reads(json: JsValue): JsResult[Map[UUID, V]] =
      JsSuccess(json.as[Map[String, V]].map { case (k, v) =>
        UUID.fromString(k) -> v
      })

    override def writes(o: Map[UUID, V]): JsValue = {
      val writer = implicitly[Writes[Map[String, V]]]
      writer.writes(o.map { case (k, v) => k.toString -> v })
    }

  }

  /**
    * Non empty list format, for a given `A` type.
    * @param format The format of `A`.
    */
  implicit def nelFormat[A](implicit format: Format[A]): Format[NonEmptyList[A]] = new Format[NonEmptyList[A]] {

    override def reads(json: JsValue): JsResult[NonEmptyList[A]] =
      Json.fromJson[List[A]](json).flatMap {
        case head :: tail => JsSuccess(NonEmptyList.of(head, tail: _*))
        case _            => JsError("Unable to parse this empty list as a JSON.")
      }

    override def writes(o: NonEmptyList[A]): JsValue =
      JsArray(o.toList.map(format.writes))

  }

  /**
    * ByteString JSON format. The ByteString is simply serialized in base64 and handled as a string.
    */
  implicit val byteStringFormat: Format[ByteString] = new Format[ByteString] {

    override def reads(json: JsValue): JsResult[ByteString] =
      Json.fromJson[String](json).flatMap { s =>
         Base64.decode(s) match {
          case Some(byteString) => JsSuccess(byteString)
          case _                => JsError("Invalid ByteString (invalid base 64 encoding)")
        }
      }

    override def writes(o: ByteString): JsValue =
      JsString(Base64.encode(o))

  }

  /**
    * Helper to print human-readable size.
    * @param size The size.
    */
  def humanReadable(size: Long): String = {
    if (size <= 0) {
      "0 B"
    } else {
      val units: Array[String] = Array("B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
      val digitGroup: Int      = (Math.log10(size) / Math.log10(1024)).toInt
      f"${size / Math.pow(1024, digitGroup)}%3.2f ${units(digitGroup)}"
    }
  }

}
