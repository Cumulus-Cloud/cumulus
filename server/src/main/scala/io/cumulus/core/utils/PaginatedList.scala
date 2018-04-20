package io.cumulus.core.utils

import play.api.libs.functional.syntax._
import play.api.libs.json._

case class PaginatedList[T](
  items: Seq[T],
  offset: Int
) extends Traversable[T] {

  override def foreach[U](f: T => U): Unit = items.foreach(f)

}

object PaginatedList {

  implicit class ListToPaginated[T](val seq: Seq[T]) extends AnyVal {

    def toPaginatedList(offset: Int): PaginatedList[T] =
      PaginatedList(seq, offset)

    def toPaginatedList(offset: Option[Int] = None): PaginatedList[T] =
      PaginatedList(seq, offset.getOrElse(0))

  }

  def empty[T]: PaginatedList[T] =
    PaginatedList(Seq.empty, 0)

  implicit def writer[T](implicit writer: Writes[T]): Writes[PaginatedList[T]] = OWrites { list =>
    val js = Json.obj(
      "items"  -> JsArray(list.items.map(i => writer.writes(i))),
      "size"   -> list.items.size,
      "offset" -> list.offset
    )

    js
  }

  implicit def reader[T](implicit reader: Reads[T]): Reads[PaginatedList[T]] = (
    (__ \ "items").read[Seq[T]] ~
    (__ \ "offset").read[Int]
  ) { (items: Seq[T], offset: Int) =>
      PaginatedList(items, offset)
  }

}


