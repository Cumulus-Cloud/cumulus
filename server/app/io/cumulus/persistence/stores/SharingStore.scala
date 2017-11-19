package io.cumulus.persistence.stores

import java.time.LocalDateTime
import java.util.UUID

import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository}
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.models.Sharing

class SharingStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[Sharing, CumulusDB, UUID] with AnormRepository[Sharing, CumulusDB] {

  val table: String   = SharingStore.table
  val pkField: String = SharingStore.pkField

  def rowParser: RowParser[Sharing] = {
    (
      SqlParser.get[UUID]("id") ~
      SqlParser.get[String]("code") ~
      SqlParser.get[Option[String]]("password") ~
      SqlParser.get[Option[LocalDateTime]]("expiration") ~
      SqlParser.get[Boolean]("needAuth") ~
      SqlParser.get[UUID]("user_id") ~
      SqlParser.get[UUID]("fsNode_id")
    ).map {
      case id ~ code ~ password ~ expiration ~ needAuth ~ owner ~ fsNode =>
        Sharing(id, code, password, expiration, needAuth, owner, fsNode)
    }
  }

  def getParams(sharing: Sharing): Seq[NamedParameter] = {
    Seq(
      'id         -> sharing.id,
      'code       -> sharing.code,
      'password   -> sharing.password,
      'expiration -> sharing.expiration,
      'needAuth   -> sharing.needAuth,
      'user_id    -> sharing.owner,
      'fsNode_id  -> sharing.fsNode
    )
  }

}

object SharingStore {

  val table: String = "sharing"

  val pkField: String = "id"
  val codeField: String = "code"
  val ownerField: String = "user_id"
  val fsNodeField: String = "fsNode_id"

}
