package io.cumulus.persistence.anorm

import java.sql.PreparedStatement

import anorm._
import enumeratum.{Enum, EnumEntry}

trait AnormEnum[A <: EnumEntry] { self: Enum[A] =>

  implicit val toStatement: ToStatement[A] = (s: PreparedStatement, index: Int, value: A) =>
    s.setObject(index, value.entryName, java.sql.Types.VARCHAR)

  @SuppressWarnings(Array("org.wartremover.warts.AsInstanceOf"))
  implicit val enumColumn: Column[A] = Column.nonNull[A] { (value, meta) =>
    value match {
      case name: String =>
        self
          .withNameInsensitiveOption(name)
          .map(v => Right(v))
          .getOrElse(Left(TypeDoesNotMatch(s"Cannot find a value of enum $self with name $name")))
      case _ =>
        Left(
          TypeDoesNotMatch(
            s"Cannot convert $value:${value.asInstanceOf[AnyRef].getClass} to enum $self for column ${meta.column}"
          )
        )
    }
  }
}
