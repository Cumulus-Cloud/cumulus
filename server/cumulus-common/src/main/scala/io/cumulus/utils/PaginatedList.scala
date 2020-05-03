package io.cumulus.utils

import play.api.libs.json._


case class EnrichedList[T](
  items: Seq[T],
  total: Option[Int] = None
) extends Traversable[T] {

  override def foreach[U](f: T => U): Unit =
    items.foreach(f)

}

object EnrichedList {

  implicit class ListToEnriched[T](val seq: Seq[T]) extends AnyVal {

    def toEnrichedList(total: Int): EnrichedList[T] =
      EnrichedList(seq, Some(total))

    def toEnrichedList: EnrichedList[T] =
      EnrichedList(seq)

  }

  def empty[T]: EnrichedList[T] =
    EnrichedList(Seq.empty)

  implicit def writer[T](implicit writer: Writes[T]): Writes[EnrichedList[T]] = OWrites { list =>
    Json.obj(
      "items" -> JsArray(list.items.map(i => writer.writes(i))),
      "total" -> list.total
    )
  }

}


case class PaginatedList[T](
  items: Seq[T],
  offset: Int,
  hasMore: Boolean
) extends Traversable[T] {

  override def foreach[U](f: T => U): Unit =
    items.foreach(f)

}

object PaginatedList {

  implicit class ListToPaginated[T](val seq: Seq[T]) extends AnyVal {

    def toPaginatedList(offset: Int, hasMore: Boolean): PaginatedList[T] =
      PaginatedList(seq, offset, hasMore)

    def toPaginatedList(offset: Option[Int], hasMore: Boolean): PaginatedList[T] =
      PaginatedList(seq, offset.getOrElse(0), hasMore)

  }

  def empty[T]: PaginatedList[T] =
    PaginatedList(Seq.empty, 0, hasMore = false)

  implicit def writer[T](implicit writer: Writes[T]): Writes[PaginatedList[T]] = OWrites { list =>
    Json.obj(
      "items"   -> JsArray(list.items.map(i => writer.writes(i))),
      "size"    -> list.items.size,
      "offset"  -> list.offset,
      "hasMore" -> list.hasMore
    )
  }

}


