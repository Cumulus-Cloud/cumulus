package io.cumulus.models.fs

import scala.collection.immutable

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}
import io.cumulus.core.persistence.anorm.AnormEnum
import play.api.mvc.QueryStringBindable

sealed abstract class FsNodeType extends EnumEntry

object FsNodeType extends Enum[FsNodeType] with PlayJsonEnum[FsNodeType] with AnormEnum[FsNodeType] {

  case object DIRECTORY extends FsNodeType
  case object FILE extends FsNodeType

  override val values: immutable.IndexedSeq[FsNodeType] = findValues

  implicit def queryBinder(implicit stringBinder: QueryStringBindable[String]): QueryStringBindable[FsNodeType] =
    new QueryStringBindable[FsNodeType] {

      def bind(key: String, value: Map[String, Seq[String]]): Option[Either[String, FsNodeType]] =
        stringBinder
          .bind(key, value)
          .map(_.flatMap(s => FsNodeType.withNameInsensitiveOption(s).toRight("Invalid node type")))

      def unbind(key: String, value: FsNodeType): String =
        value.entryName

    }

}
