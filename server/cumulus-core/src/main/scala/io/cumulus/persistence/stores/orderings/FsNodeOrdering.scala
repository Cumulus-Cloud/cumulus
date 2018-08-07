package io.cumulus.persistence.stores.orderings

import scala.collection.immutable
import enumeratum.{Enum, EnumEntry}
import io.cumulus.core.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.core.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.FsNodeStore._
import io.cumulus.persistence.stores.orderings.FsNodeOrderingType.{OrderByFilenameAsc, OrderByNodeType}
import play.api.mvc.QueryStringBindable


sealed abstract class FsNodeOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}

object FsNodeOrderingType extends Enum[FsNodeOrderingType] {

  // Note: since we use LocalDateTime, we can use the alphabetical order to sort dates

  case object OrderByFilenameAsc      extends FsNodeOrderingType(nameField, ASC)
  case object OrderByFilenameDesc     extends FsNodeOrderingType(nameField, DESC)
  case object OrderByCreationAsc      extends FsNodeOrderingType(s"$metadataField ->> 'creation'", ASC)
  case object OrderByCreationDesc     extends FsNodeOrderingType(s"$metadataField ->> 'creation'", DESC)
  case object OrderByModificationAsc  extends FsNodeOrderingType(s"$metadataField ->> 'modification'", ASC)
  case object OrderByModificationDesc extends FsNodeOrderingType(s"$metadataField ->> 'modification'", DESC)
  case object OrderByNodeType         extends FsNodeOrderingType(nodeTypeField, ASC)

  override val values: immutable.IndexedSeq[FsNodeOrderingType] = findValues

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

  val default: FsNodeOrdering =
    FsNodeOrdering.of(OrderByNodeType, OrderByFilenameAsc)

  def of(orders: FsNodeOrderingType*): FsNodeOrdering =
    FsNodeOrdering(orders)

  implicit def queryStringBindable(implicit stringBinder: QueryStringBindable[String]): QueryStringBindable[FsNodeOrdering] =
    new QueryStringBindable[FsNodeOrdering] {

      def bind(key: String, params: Map[String, Seq[String]]): Option[Either[String, FsNodeOrdering]] =
        params
          .get(key)
          .map(_.flatMap { value =>
            FsNodeOrderingType.withNameInsensitiveOption(value)
          })
          .map(ordering => Right(FsNodeOrdering(ordering)))

      def unbind(key: String, ordering: FsNodeOrdering): String =
        stringBinder.unbind(key, ordering.orders.mkString(","))

    }

}
