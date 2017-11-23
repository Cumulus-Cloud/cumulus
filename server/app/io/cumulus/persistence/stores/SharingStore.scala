package io.cumulus.persistence.stores

import java.time.LocalDateTime
import java.util.UUID

import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository}
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.models.{Sharing, SharingSecurity}

class SharingStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[Sharing, CumulusDB, UUID] with AnormRepository[Sharing, CumulusDB] {

  val table: String   = SharingStore.table
  val pkField: String = SharingStore.pkField

  def rowParser: RowParser[Sharing] = {
    (
      SqlParser.get[UUID]("id") ~
      SqlParser.get[String]("reference") ~
      SqlParser.get[Option[LocalDateTime]]("expiration") ~
      SqlParser.get[UUID]("user_id") ~
      SqlParser.get[UUID]("fsNode_id") ~
      SqlParser.get[String]("encryptedPrivateKey") ~
      SqlParser.get[String]("privateKeySalt") ~
      SqlParser.get[String]("salt1") ~
      SqlParser.get[String]("iv") ~
      SqlParser.get[String]("secretCodeHash") ~
      SqlParser.get[String]("salt2")
    ).map {
      case id ~ reference ~ expiration ~ owner ~ fsNode ~ encryptedPrivateKey ~ privateKeySalt ~ salt1 ~ iv ~ secretCodeHash ~ salt2 =>
        val sharingSecurity = SharingSecurity(
          encryptedPrivateKey,
          privateKeySalt,
          salt1,
          iv,
          secretCodeHash,
          salt2
        )

        Sharing(id, reference, expiration, owner, fsNode, sharingSecurity)
    }
  }

  def getParams(sharing: Sharing): Seq[NamedParameter] = {
    Seq(
      'id                  -> sharing.id,
      'reference           -> sharing.reference,
      'expiration          -> sharing.expiration,
      'user_id             -> sharing.owner,
      'fsNode_id           -> sharing.fsNode,
      'encryptedPrivateKey -> sharing.security.encryptedPrivateKey,
      'privateKeySalt      -> sharing.security.privateKeySalt,
      'salt1               -> sharing.security.salt1,
      'iv                  -> sharing.security.iv,
      'secretCodeHash      -> sharing.security.secretCodeHash,
      'salt2               -> sharing.security.salt2,
    )
  }

}

object SharingStore {

  val table: String = "sharing"

  val pkField: String        = "id"
  val referenceField: String = "reference"
  val ownerField: String     = "user_id"
  val fsNodeField: String    = "fsNode_id"

}
