package io.cumulus.persistence.stores.orderings

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry}
import io.cumulus.core.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.core.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.FsNodeStore._
import play.api.mvc.QueryStringBindable


sealed abstract class FsNodeOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}

object FsNodeOrderingType extends Enum[FsNodeOrderingType] {

  case object BY_NODE_TYPE extends FsNodeOrderingType(nodeTypeField, ASC)
  case object BY_FILENAME_ASC extends FsNodeOrderingType(nameField, ASC)
  case object BY_FILENAME_DESC extends FsNodeOrderingType(nameField, DESC)
  case object BY_CREATION_DATE_ASC extends FsNodeOrderingType(s"$metadataField ->> 'creation'", ASC)
  case object BY_CREATION_DATE_DESC extends FsNodeOrderingType(s"$metadataField ->> 'creation'", DESC)
  case object BY_MODIFICATION_DATE_ASC extends FsNodeOrderingType(s"$metadataField ->> 'modification'", ASC)
  case object BY_MODIFICATION_DATE_DESC extends FsNodeOrderingType(s"$metadataField ->> 'modification'", DESC)

  override val values: immutable.IndexedSeq[FsNodeOrderingType] = findValues

  implicit def queryBinder(implicit stringBinder: QueryStringBindable[String]): QueryStringBindable[FsNodeOrderingType] =
    new QueryStringBindable[FsNodeOrderingType] {

      def bind(key: String, value: Map[String, Seq[String]]): Option[Either[String, FsNodeOrderingType]] =
        stringBinder
          .bind(key, value)
          .map(_.flatMap(s => FsNodeOrderingType.withNameInsensitiveOption(s).toRight("Invalid node ordering")))

      def unbind(key: String, value: FsNodeOrderingType): String =
        value.entryName

    }

}

case class FsNodeOrdering(
  orders: Seq[FsNodeOrderingType]
) extends QueryOrdering {

  val orderings: Seq[SqlOrdering] =
    orders.map(_.toSqlOrdering)

}

object FsNodeOrdering {

  val empty: FsNodeOrdering =
    FsNodeOrdering(Seq.empty)

  def of(orders: FsNodeOrderingType*): FsNodeOrdering =
    FsNodeOrdering(orders)

}
