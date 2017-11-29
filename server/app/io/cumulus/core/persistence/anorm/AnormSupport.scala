package io.cumulus.core.persistence.anorm

import java.sql.{Clob, PreparedStatement}
import java.util.UUID

import akka.util.ByteString
import anorm._
import io.cumulus.core.utils.Base64
import org.apache.commons.io.IOUtils
import org.postgresql.util.PGobject
import play.api.libs.json._

/**
  * Anorm helpers.
  */
object AnormSupport {

  /**
    * Implicit statement for UUID with PostgreSQL.
    */
  implicit object UUIDStatement extends ToStatement[UUID] {
    override def set(s: PreparedStatement, index: Int, v: UUID): Unit = {
      val uuid = new PGobject()
      uuid.setType("uuid")
      uuid.setValue(v.toString)
      s.setObject(index, uuid)
    }
  }

  /**
    * Implicit statement for ByteString with PostgreSQL.
    */
  implicit object ByteStringStatement extends ToStatement[ByteString] {
    override def set(s: PreparedStatement, index: Int, v: ByteString): Unit = {
      val byteString = new PGobject()
      byteString.setType("text")
      byteString.setValue(Base64.encode(v))
      s.setObject(index, byteString)
    }
  }

  /**
    * Implicit statement for JsObject with PostgreSQL.
    */
  implicit object JsObjectStatement extends ToStatement[JsObject] {
    override def set(s: PreparedStatement, index: Int, v: JsObject): Unit = {
      val jsonObject = new PGobject()
      jsonObject.setType("json")
      jsonObject.setValue(Json.stringify(v))
      s.setObject(index, jsonObject)
    }
  }


  /**
    * Implicit statement for ByteString with PostgreSQL, using an internal Base64 storage for convenience.
    */
  implicit def columnByteString: Column[ByteString] = Column.nonNull(
    (value, meta) => {
      val MetaDataItem(qualified, _, _) = meta
      value match {
        case s: String =>
          Base64.decode(s) match {
            case Some(byteString) =>
              Right(byteString)
            case None =>
              Left(TypeDoesNotMatch(s"String '$s' is not a valid base 64 encoded string"))
          }
        case _ =>
          cannotConvertError(value, qualified, "ByteString")
      }
    }
  )

  /**
    * Column parser for JsObject with PostgreSQL.
    */
  def column[T](implicit reads: Reads[T]): Column[T] = Column.nonNull(
    (value, meta) => {
      val MetaDataItem(qualified, _, _) = meta
      value match {
        case pgobject: PGobject if pgobject.getType == "jsonb" =>
          toJson(meta, pgobject.getValue)
        case clob: Clob =>
          toJson(meta, IOUtils.toString(clob.getCharacterStream()))
        case _ =>
          cannotConvertError(value, qualified, "JsValue")
      }
    }
  )

  /**
    * Column parser for optional JsObject with PostgreSQL.
    */
  def columnOpt[T](implicit reads: Reads[T]): Column[Option[T]] = Column(
    (value, meta) => {
      val MetaDataItem(qualified, _, _) = meta
      value match {
        case null =>
          Right(None)
        case pgobject: PGobject if pgobject.getType == "jsonb" =>
          toJson(meta, pgobject.getValue).map(Some.apply)
        case clob: Clob =>
          toJson(meta, IOUtils.toString(clob.getCharacterStream())).map(Some.apply)
        case _ =>
          cannotConvertError(value, qualified, "JsValue")
      }
    }
  )

  private def toJson[A](meta: MetaDataItem, content: String)(implicit reads: Reads[A]) =
    if (content.nonEmpty)
      reads.reads(Json.parse(content))
        .fold(
          jsonParseError(meta, content),
          res => Right(res)
        )
    else
      Left(UnexpectedNullableFound(""))

  private def jsonParseError[T](meta: MetaDataItem, content: String)(err: Seq[(JsPath, Seq[JsonValidationError])]) =
    Left(
      TypeDoesNotMatch(
        s"Trying to parse JSON from column ${meta.column} which value is ###$content### Error is : $err " + err
      )
    )

  private def cannotConvertError(value: Any, qualified: ColumnName, targetTypeName: String) =
    Left(
      TypeDoesNotMatch(
        s"Cannot convert $value: ${value.asInstanceOf[AnyRef].getClass} to $targetTypeName for column $qualified"
      )
    )
}
