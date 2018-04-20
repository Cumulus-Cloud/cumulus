package io.cumulus.core.persistence.anorm

import java.sql.PreparedStatement

import anorm._
import enumeratum.{Enum, EnumEntry}

trait AnormEnum[A <: EnumEntry] { self: Enum[A] =>

  implicit val toStatement = new ToStatement[A] {
    def set(s: PreparedStatement, index: Int, value: A): Unit =
      s.setObject(index, value.entryName, java.sql.Types.VARCHAR)
  }

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
