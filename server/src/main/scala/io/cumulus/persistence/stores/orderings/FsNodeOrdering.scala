package io.cumulus.persistence.stores.orderings

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry}
import io.cumulus.core.persistence.query.QueryOrderingDirection.{ASC, DESC}
import io.cumulus.core.persistence.query.{QueryOrdering, QueryOrderingDirection, SqlOrdering}
import io.cumulus.persistence.stores.FsNodeStore._


sealed abstract class FsNodeOrderingType(sql: String, direction: QueryOrderingDirection) extends EnumEntry {

  def toSqlOrdering: SqlOrdering =
    SqlOrdering(sql, direction)

}

object QueryOrderingType extends Enum[FsNodeOrderingType] {

  case object OrderByFilenameAsc extends FsNodeOrderingType(nameField, ASC)
  case object OrderByFilenameDesc extends FsNodeOrderingType(nameField, DESC)
  case object OrderByCreationAsc extends FsNodeOrderingType(s"$metadataField ->> 'creation'", ASC)
  case object OrderByCreationDesc extends FsNodeOrderingType(s"$metadataField ->> 'creation'", DESC)
  case object OrderByModificationAsc extends FsNodeOrderingType(s"$metadataField ->> 'modification'", ASC)
  case object OrderByModificationDesc extends FsNodeOrderingType(s"$metadataField ->> 'modification'", DESC)
  case object OrderByNodeType extends FsNodeOrderingType(nodeTypeField, ASC)

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

  def of(orders: FsNodeOrderingType*): FsNodeOrdering =
    FsNodeOrdering(orders)

}
