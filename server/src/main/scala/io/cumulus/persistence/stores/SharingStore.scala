package io.cumulus.persistence.stores

import java.time.LocalDateTime
import java.util.UUID

import akka.util.ByteString
import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository}
import io.cumulus.core.persistence.query.{Query, QueryBuilder}
import io.cumulus.models.fs.FsNode
import io.cumulus.models.{Sharing, SharingSecurity}

/**
  * Sharing store, used to manage sharings in the database.
  */
class SharingStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[Sharing, CumulusDB, UUID] with AnormRepository[Sharing, CumulusDB] {

  val table: String   = SharingStore.table
  val pkField: String = SharingStore.pkField

  /**
    * Find the sharings for a provided node.
    * @param fsNode The shared node.
    */
  def findByNode(fsNode: FsNode): Query[CumulusDB, List[Sharing]] =
    qb { implicit c =>

      val idField = s"${FsNodeStore.table}.${FsNodeStore.pkField}"

      SQL"""
          SELECT
            #$table.#$pkField,
            #$table.reference,
            #$table.expiration,
            #$table.user_id,
            #$table.fsNode_id,
            #$table.encryptedPrivateKey,
            #$table.privateKeySalt,
            #$table.salt1,
            #$table.iv,
            #$table.secretCodeHash,
            #$table.salt2
            FROM #$table
          INNER JOIN #${FsNodeStore.table}
          ON #$table.fsNode_id = #${FsNodeStore.table}.id
          WHERE #$idField = ${fsNode.id}
        """.as(rowParser.*)
    }

  /**
    * Find and lock the sharings for a provided node.
    * @param fsNode The shared node.
    */
  def findAndLockByNode(fsNode: FsNode): Query[CumulusDB, List[Sharing]] =
    qb { implicit c =>

      val idField = s"${FsNodeStore.table}.${FsNodeStore.pkField}"

      SQL"""
          SELECT
            #$table.#$pkField,
            #$table.reference,
            #$table.expiration,
            #$table.user_id,
            #$table.fsNode_id,
            #$table.encryptedPrivateKey,
            #$table.privateKeySalt,
            #$table.salt1,
            #$table.iv,
            #$table.secretCodeHash,
            #$table.salt2
            FROM #$table
          INNER JOIN #${FsNodeStore.table}
          ON #$table.fsNode_id = #${FsNodeStore.table}.id
          WHERE #$idField = ${fsNode.id}
          FOR UPDATE
        """.as(rowParser.*)
    }

  def rowParser: RowParser[Sharing] = {
    (
      SqlParser.get[UUID]("id") ~
      SqlParser.get[String]("reference") ~
      SqlParser.get[Option[LocalDateTime]]("expiration") ~
      SqlParser.get[UUID]("user_id") ~
      SqlParser.get[UUID]("fsNode_id") ~
      SqlParser.get[ByteString]("encryptedPrivateKey") ~
      SqlParser.get[ByteString]("privateKeySalt") ~
      SqlParser.get[ByteString]("salt1") ~
      SqlParser.get[ByteString]("iv") ~
      SqlParser.get[ByteString]("secretCodeHash") ~
      SqlParser.get[ByteString]("salt2")
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
