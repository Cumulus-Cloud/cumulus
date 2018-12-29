package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.core.persistence.query._
import io.cumulus.core.utils.PaginatedList
import io.cumulus.core.utils.PaginatedList._
import io.cumulus.models.fs.{FsNode, FsNodeIndex, FsNodeType, Path}
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.FsNodeStore._
import io.cumulus.persistence.stores.orderings.FsNodeOrdering


/**
  * Filesystem node store, used to manage fs node in the database.
  */
class FsNodeStore extends AnormPKOperations[FsNode, UUID] with AnormRepository[FsNode] {

  val table: String   = FsNodeStore.table
  val pkField: String = FsNodeStore.pkField

  /**
    * Return the index (all the paths of the files and directories).
    * @param user The owner of the elements.
    */
  def findIndexByUser(user: User) =
    Query { implicit c =>
      SQL"SELECT #$pathField, #$nodeTypeField FROM #$table WHERE #$ownerField = ${user.id} ORDER BY #$pathField"
        .as(fsNodeIndexParse.*)
    }

  /**
    * Find by a provided path and a provided user, used as the owner.
    * @param path The path to look for.
    * @param user The owner of the element.
    */
  def findByPathAndUser(path: Path, user: User): Query[Option[FsNode]] =
    Query { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField = ${path.toString}"
        .as(rowParser.singleOpt)
    }

  /**
    * Find by a primary key and a provided user, used as the owner.
    * @param id The ID of the node.
    * @param user The owner of the element.
    */
  def findByIdAndUser(id: UUID, user: User): Query[Option[FsNode]] =
    Query { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$pkField = $id AND #$ownerField = ${user.id}"
        .as(rowParser.singleOpt)
    }

  /**
    * Find by a provided path and a provided user, used as the owner.
    * @param path The path to look for.
    * @param user The owner of the element.
    */
  def findAndLockByPathAndUser(path: Path, user: User): Query[Option[FsNode]] =
    Query { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField = ${path.toString} FOR UPDATE"
        .as(rowParser.singleOpt)
    }

  /**
    * Find by a provided path and a provided user, used as the owner.
    * @param id The ID of the node.
    * @param user The owner of the element.
    */
  def findAndLockByIdAndUser(id: UUID, user: User): Query[Option[FsNode]] =
    Query { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$pkField = $id AND #$ownerField = ${user.id} FOR UPDATE"
        .as(rowParser.singleOpt)
    }

  /**
    * Find the contained elements for a provided path and user. Paginated.
    * @param path The parent path of the elements to look for.
    * @param user The owner of the elements.
    */
  def findContainedByPathAndUser(
    path: Path,
    user: User,
    pagination: QueryPagination,
    ordering: FsNodeOrdering = FsNodeOrdering.empty
  ): Query[PaginatedList[FsNode]] = {
    // Match directory starting by the location, but only on the direct level
    val regex = if (path.isRoot) "^/[^/]+$" else s"^${path.toString}/[^/]+$$"
    val paginationPlusOne = pagination.copy(limit = pagination.limit + 1)

    Query { implicit c =>

      val result =
        SQL"SELECT #$metadataField FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField ~ $regex #${ordering.toORDER} #${paginationPlusOne.toLIMIT}"
          .as(rowParser.*)

      result.take(pagination.limit).toPaginatedList(pagination.offset, result.length > pagination.limit)
    }
  }

  /**
    * Count the contained elements for a provided path and user.
    * @param path The parent path of the elements to look for.
    * @param user The owner of the elements.
    */
  def countContainedByPathAndUser(
    path: Path,
    user: User
  ): Query[Long] = {
    // Match directory starting by the location, but only on the direct level
    val regex = if (path.isRoot) "^/[^/]+$" else s"^${path.toString}/[^/]+$$"

    Query { implicit c =>
      SQL"SELECT COUNT(*) FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField ~ $regex"
        .as(SqlParser.scalar[Long].single)
    }
  }

  /**
    * Delete a node and its content.
    * @param node The node to be deleted (with its content).
    * @param user The owner of the node.
    */
  def deleteWithContent(node: FsNode, user: User): Query[Int] = {
    val searchRegex = s"^${node.path.toString}(/.*|$$)"

    Query { implicit c =>
      SQL"DELETE FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField ~ $searchRegex"
        .executeUpdate()
    }
  }

  /**
    * Move any node to a specified location.
    * @param node The node to move.
    * @param to The destination.
    * @param user The owner of the node.
    */
  def moveFsNode(node: FsNode, to: Path, user: User): Query[Int] = {
    val searchRegex = s"^${node.path.toString}(/.*|$$)"
    val replaceRegex = s"^${node.path.toString}"

    // For performance reasons we want to directly update any matching element, but since information are duplicated
    // we also need to update the JSONb.. we also need to update the field name of the moved node
    Query { implicit c =>
      SQL"""
        UPDATE #$table
        SET #$pathField = regexp_replace(#$pathField, $replaceRegex, ${to.toString}),
            #$metadataField = jsonb_set(#$metadataField, '{#$pathField}', to_jsonb(regexp_replace(#$pathField, $replaceRegex, ${to.toString})))
        WHERE #$ownerField = ${user.id} AND #$pathField ~ $searchRegex;

        UPDATE #$table
        SET #$nameField = ${to.name}
        WHERE #$pkField = ${node.id} AND #$ownerField = ${user.id};
      """
        .executeUpdate()
    }
  }

  def rowParser: RowParser[FsNode] = {
    implicit def fsNodeColumn: Column[FsNode] = AnormSupport.column[FsNode](FsNode.internalFormat)

    SqlParser.get[FsNode]("metadata")
  }

  private val fsNodeIndexParse: RowParser[FsNodeIndex] =
    SqlParser.get[String](pathField) ~
    SqlParser.get[FsNodeType](nodeTypeField) map {
      case path ~ nodeType =>
        FsNodeIndex(path, nodeType)
    }

  def getParams(node: FsNode): Seq[NamedParameter] =
    Seq(
      FsNodeStore.pkField           -> node.id,
      FsNodeStore.pathField         -> node.path.toString,
      FsNodeStore.nameField         -> node.path.name,
      FsNodeStore.nodeTypeField     -> node.nodeType,
      FsNodeStore.creationField     -> node.creation,
      FsNodeStore.modificationField -> node.modification,
      FsNodeStore.hiddenField       -> node.hidden,
      FsNodeStore.ownerField        -> node.owner,
      FsNodeStore.metadataField     -> FsNode.internalFormat.writes(node)
    )

}

object FsNodeStore {

  val table: String = "fs_node"

  val pkField: String           = "id"
  val pathField: String         = "path"
  val nameField: String         = "name"
  val nodeTypeField: String     = "node_type"
  val creationField: String     = "creation"
  val modificationField: String = "modification"
  val hiddenField: String       = "hidden"
  val ownerField: String        = "user_id"
  val metadataField: String     = "metadata"

}
