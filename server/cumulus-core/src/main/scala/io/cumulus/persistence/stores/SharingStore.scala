package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.persistence.anorm.AnormSupport._
import io.cumulus.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.persistence.query.{Query, QueryPagination}
import io.cumulus.utils.PaginatedList
import io.cumulus.utils.PaginatedList._
import io.cumulus.models.fs.FsNode
import io.cumulus.models.sharing.Sharing
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.SharingStore._

/**
  * Sharing store, used to manage sharings in the database.
  */
class SharingStore extends AnormPKOperations[Sharing, UUID] with AnormRepository[Sharing] {

  val table: String   = SharingStore.table
  val pkField: String = SharingStore.pkField

  /**
    * Find the sharing for a provided reference.
    *
    * @param reference The unique reference to search.
    */
  def findByReference(reference: String): Query[Option[Sharing]] =
    Query { implicit c =>

      SQL"""
          SELECT #$table.#$metadataField
          FROM #$table
          WHERE #$referenceField = $reference
        """.as(rowParser.singleOpt)
    }

  /**
    * Find the sharings for a provided user.
    *
    * @param user The user.
    * @param pagination The pagination to use.
    */
  def findByUser(user: User, pagination: QueryPagination): Query[PaginatedList[Sharing]] =
    Query { implicit c =>
      val paginationPlusOne = pagination.copy(limit = pagination.limit + 1)

      val result =
        SQL"""
            SELECT #$table.#$metadataField
            FROM #$table
            WHERE #$ownerField = ${user.id}
            #${paginationPlusOne.toLIMIT}
          """.as(rowParser.*)

      result.take(pagination.limit).toPaginatedList(pagination.offset, result.length > pagination.limit)
    }

  /**
    * Find the sharings for a provided node.
    *
    * @param node The shared node.
    * @param pagination The pagination to use.
    */
  def findByNode(node: FsNode, pagination: QueryPagination): Query[PaginatedList[Sharing]] =
    Query { implicit c =>
      val paginationPlusOne = pagination.copy(limit = pagination.limit + 1)

      val result =
        SQL"""
            SELECT #$table.#$metadataField
            FROM #$table
            WHERE #$fsNodeField = ${node.id}
            #${paginationPlusOne.toLIMIT}
          """.as(rowParser.*)

      result.take(pagination.limit).toPaginatedList(pagination.offset, result.length > pagination.limit)
    }

  /**
    * Delete the sharings for a provided node.
    *
    * @param node The shared node.
    */
  def deleteByNode(node: FsNode, user: User): Query[Int] =
    Query { implicit c =>

      SQL"""
          DELETE FROM  #$table
          WHERE #$fsNodeField = ${node.id} AND #$ownerField = ${user.id}
        """.executeUpdate()
    }

  /**
    * Delete the sharings for a provided node.
    *
    * @param node The parent shared node.
    */
  def deleteByParentNode(node: FsNode, user: User): Query[Int] =
    Query { implicit c =>
      val searchRegex = s"^${node.path.toString}(/.*|$$)"

      SQL"""
        DELETE FROM #$table
        WHERE #$pkField IN (
          SELECT #${FsNodeStore.table}.#${FsNodeStore.pkField}
          FROM #${FsNodeStore.table}
          WHERE #${FsNodeStore.table}.#${FsNodeStore.pathField} ~ $searchRegex AND #$ownerField = ${user.id}
        )
      """.executeUpdate()
    }

  val rowParser: RowParser[Sharing] = {
    implicit val sharingColumn: Column[Sharing] =
      AnormSupport.column[Sharing](Sharing.internalFormat)

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
