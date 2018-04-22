package io.cumulus.persistence.stores

import java.time.LocalDateTime
import java.util.UUID

import akka.util.ByteString
import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.core.persistence.query.{Query, QueryBuilder, QueryPagination}
import io.cumulus.core.utils.PaginatedList
import io.cumulus.core.utils.PaginatedList._
import io.cumulus.models._
import io.cumulus.models.fs.FsNode
import io.cumulus.persistence.stores.SharingStore._

/**
  * Sharing store, used to manage sharings in the database.
  */
class SharingStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[Sharing, CumulusDB, UUID] with AnormRepository[Sharing, CumulusDB] {

  val table: String   = SharingStore.table
  val pkField: String = SharingStore.pkField

  /**
    * Find the sharings information for a provided user.
    * @param user The user.
    * @param pagination The pagination to use.
    */
  def findInfoByUser(user: User, pagination: QueryPagination): Query[CumulusDB, PaginatedList[SharingInfo]] =
    qb { implicit c =>
      SQL"""
          SELECT #$selectAllWithFsNode
          FROM #$table
          INNER JOIN #${FsNodeStore.table}
          ON #$table.#$fsNodeField = #${FsNodeStore.table}.#${FsNodeStore.pkField}
          WHERE #$table.#$ownerField = ${user.id}
          #${pagination.toLIMIT}
        """.as(withFsNodeRowParser.*).toPaginatedList(pagination.offset)
    }

  /**
    * Find the sharings information for a provided node.
    * @param fsNode The node.
    * @param pagination The pagination to use.
    */
  def findInfoByNode(fsNode: FsNode, pagination: QueryPagination): Query[CumulusDB, PaginatedList[SharingInfo]] =
    qb { implicit c =>
      SQL"""
          SELECT #$selectAllWithFsNode
          FROM #$table
          INNER JOIN #${FsNodeStore.table}
          ON #$table.#$fsNodeField = #${FsNodeStore.table}.#${FsNodeStore.pkField}
          WHERE #$table.#$fsNodeField = ${fsNode.id}
          #${pagination.toLIMIT}
        """.as(withFsNodeRowParser.*).toPaginatedList(pagination.offset)
    }

  /**
    * Find the sharings for a provided node.
    * @param reference The unique reference to search.
    */
  def findInfoByReference(reference: String): Query[CumulusDB, Option[SharingInfo]] =
    qb { implicit c =>

      SQL"""
          SELECT #$selectAllWithFsNode
          FROM #$table
          INNER JOIN #${FsNodeStore.table}
          ON #$table.#$fsNodeField = #${FsNodeStore.table}.#${FsNodeStore.pkField}
          WHERE #$referenceField = $reference
        """.as(withFsNodeRowParser.singleOpt)
    }

  /**
    * Find the sharings for a provided node.
    * @param fsNode The shared node.
    * @param pagination The pagination to use.
    */
  def findByNode(fsNode: FsNode, pagination: QueryPagination): Query[CumulusDB, PaginatedList[Sharing]] =
    qb { implicit c =>

      SQL"""
          SELECT #$selectAll
          FROM #$table
          WHERE #$fsNodeField = ${fsNode.id}
          #${pagination.toLIMIT}
        """.as(rowParser.*).toPaginatedList(pagination.offset)
    }

  /**
    * Find and lock the sharings for a provided node.
    * @param fsNode The shared node.
    */
  def findAndLockByNode(fsNode: FsNode): Query[CumulusDB, List[Sharing]] =
    qb { implicit c =>

      SQL"""
          SELECT #$selectAll
          FROM #$table
          WHERE #$fsNodeField = ${fsNode.id}
          FOR UPDATE
        """.as(rowParser.*)
    }

  val selectAll =
    s"""
      $table.$pkField,
      $table.$referenceField,
      $table.$expirationField,
      $table.$ownerField,
      $table.$fsNodeField,
      $table.$encryptedPrivateKeyField,
      $table.$privateKeySaltField,
      $table.$salt1Field,
      $table.$ivField,
      $table.$secretCodeHashField,
      $table.$salt2Field
    """

  val selectAllWithFsNode =
    s"""
      $selectAll,
      ${FsNodeStore.table}.${FsNodeStore.metadataField}
    """

  val withFsNodeRowParser: RowParser[SharingInfo] = {
    implicit def fsNodeCase: Column[FsNode] = AnormSupport.column[FsNode](FsNode.internalFormat)

    SqlParser.get[FsNode]("metadata")
    (
      SqlParser.get[UUID](pkField) ~
      SqlParser.get[String](referenceField) ~
      SqlParser.get[Option[LocalDateTime]](expirationField) ~
      SqlParser.get[UUID](ownerField) ~
      SqlParser.get[UUID](fsNodeField) ~
      SqlParser.get[ByteString](encryptedPrivateKeyField) ~
      SqlParser.get[ByteString](privateKeySaltField) ~
      SqlParser.get[ByteString](salt1Field) ~
      SqlParser.get[ByteString](ivField) ~
      SqlParser.get[ByteString](secretCodeHashField) ~
      SqlParser.get[ByteString](salt2Field) ~
      SqlParser.get[FsNode](FsNodeStore.metadataField)
    ).map {
      case id ~ reference ~ expiration ~ owner ~ fsNodeUUID ~ encryptedPrivateKey ~ privateKeySalt ~ salt1 ~ iv ~ secretCodeHash ~ salt2 ~ fsNode =>
        val sharingSecurity = SharingSecurity(
          encryptedPrivateKey,
          privateKeySalt,
          salt1,
          iv,
          secretCodeHash,
          salt2
        )

        SharingInfo(Sharing(id, reference, expiration, owner, fsNodeUUID, sharingSecurity), fsNode)
    }
  }

  val rowParser: RowParser[Sharing] = {
    (
      SqlParser.get[UUID](pkField) ~
      SqlParser.get[String](referenceField) ~
      SqlParser.get[Option[LocalDateTime]](expirationField) ~
      SqlParser.get[UUID](ownerField) ~
      SqlParser.get[UUID](fsNodeField) ~
      SqlParser.get[ByteString](encryptedPrivateKeyField) ~
      SqlParser.get[ByteString](privateKeySaltField) ~
      SqlParser.get[ByteString](salt1Field) ~
      SqlParser.get[ByteString](ivField) ~
      SqlParser.get[ByteString](secretCodeHashField) ~
      SqlParser.get[ByteString](salt2Field)
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
      'salt2               -> sharing.security.salt2
    )
  }
}

object SharingStore {

  val table: String = "sharing"

  val pkField: String                  = "id"
  val referenceField: String           = "reference"
  val expirationField: String          = "expiration"
  val ownerField: String               = "user_id"
  val fsNodeField: String              = "fsNode_id"
  val encryptedPrivateKeyField: String = "encryptedPrivateKey"
  val privateKeySaltField: String      = "privateKeySalt"
  val salt1Field: String               = "salt1"
  val ivField: String                  = "iv"
  val secretCodeHashField: String      = "secretCodeHash"
  val salt2Field: String               = "salt2"

}
