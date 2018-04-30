package io.cumulus.persistence.stores

import java.util.UUID

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
          SELECT #$table.#$metadataField, #${FsNodeStore.table}.#${FsNodeStore.metadataField}
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
          SELECT #$table.#$metadataField, #${FsNodeStore.table}.#${FsNodeStore.metadataField}
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
          SELECT #$table.#$metadataField, #${FsNodeStore.table}.#${FsNodeStore.metadataField}
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
          SELECT #$table.#$metadataField
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
          SELECT #$table.#$metadataField
          FROM #$table
          WHERE #$fsNodeField = ${fsNode.id}
          FOR UPDATE
        """.as(rowParser.*)
    }

  val withFsNodeRowParser: RowParser[SharingInfo] = {
    implicit def sharingColumn: Column[Sharing] = AnormSupport.column[Sharing](Sharing.internalFormat)
    implicit def fsNodeColumn: Column[FsNode]   = AnormSupport.column[FsNode](FsNode.internalFormat)

    (
      SqlParser.get[Sharing](s"$table.$metadataField") ~
      SqlParser.get[FsNode](s"${FsNodeStore.table}.${FsNodeStore.metadataField}")
    ).map {
      case sharing ~ fsNode =>
        SharingInfo(sharing, fsNode)
    }
  }

  val rowParser: RowParser[Sharing] = {
    implicit def sharingColumn: Column[Sharing] = AnormSupport.column[Sharing](Sharing.internalFormat)

    SqlParser.get[Sharing]("metadata")
  }

  def getParams(sharing: Sharing): Seq[NamedParameter] = {
    Seq(
      'id                  -> sharing.id,
      'reference           -> sharing.reference,
      'user_id             -> sharing.owner,
      'fsNode_id           -> sharing.fsNode,
      'metadata            -> Sharing.internalFormat.writes(sharing)
    )
  }
}

object SharingStore {

  val table: String = "sharing"

  val pkField: String        = "id"
  val referenceField: String = "reference"
  val ownerField: String     = "user_id"
  val fsNodeField: String    = "fsNode_id"
  val metadataField: String  = "metadata"

}
