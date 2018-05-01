package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.core.persistence.query._
import io.cumulus.core.utils.PaginatedList
import io.cumulus.core.utils.PaginatedList._
import io.cumulus.models.fs.{Directory, FsNode}
import io.cumulus.models.{Path, User}
import io.cumulus.persistence.stores.FsNodeStore._
import io.cumulus.persistence.stores.orderings.FsNodeOrdering

/**
  * Filesystem node store, used to manage fs node in the database.
  */
class FsNodeStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[FsNode, CumulusDB, UUID] with AnormRepository[FsNode, CumulusDB] {

  val table: String   = FsNodeStore.table
  val pkField: String = FsNodeStore.pkField

  /**
    * Find by a provided path and a provided user, used as the owner.
    * @param path The path to look for.
    * @param user The owner of the element.
    */
  def findByPathAndUser(path: Path, user: User): Query[CumulusDB, Option[FsNode]] =
    qb { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField = ${path.toString}"
        .as(rowParser.singleOpt)
    }

  /**
    * Find by a provided path and a provided user, used as the owner.
    * @param path The path to look for.
    * @param user The owner of the element.
    */
  def findAndLockByPathAndUser(path: Path, user: User): Query[CumulusDB, Option[FsNode]] =
    qb { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField = ${path.toString} FOR UPDATE"
        .as(rowParser.singleOpt)
    }

  /**
    * Find the contained elements for a provided path and user.
    * @param path The parent path of the elements to look for.
    * @param user The owner of the elements.
    */
  def findContainedByPathAndUser(
    path: Path,
    user: User,
    pagination: QueryPagination,
    ordering: FsNodeOrdering = FsNodeOrdering.empty
  ): Query[CumulusDB, PaginatedList[FsNode]] = {
    // Match directory starting by the location, but only on the direct level
    val regex = if (path.isRoot) "^/[^/]+$" else s"^${path.toString}/[^/]+$$"

    qb { implicit c =>
      SQL"SELECT #$metadataField FROM #$table WHERE #$ownerField = ${user.id} AND #$pathField ~ $regex #${ordering.toORDER} #${pagination.toLIMIT}"
        .as(rowParser.*)
        .toPaginatedList(pagination.offset)
    }
  }

  /**
    * Move any node to a specified location.
    * @param node The node to move.
    * @param to The destination.
    * @param user The owner of the element.
    */
  def moveFsNode(node: FsNode, to: Path, user: User): Query[CumulusDB, Int] = {
    val searchRegex = s"^${node.path.toString}(/.*|$$)"
    val replaceRegex = s"^${node.path.toString}"

    // For performance reasons we want to directly update any matching element, but since information are duplicated
    // we also need to update the JSONb.. we also need to update the field name of the moved node
    qb { implicit c =>
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

  def getParams(fsNode: FsNode): Seq[NamedParameter] = {
    val updatedFsNode = fsNode match {
      case directory: Directory =>
        directory.copy(content = Seq.empty) // Always remove content for directories
      case other =>
        other
    }

    Seq(
      'id           -> updatedFsNode.id,
      'path         -> updatedFsNode.path.toString,
      'name         -> updatedFsNode.path.name,
      'node_type    -> updatedFsNode.nodeType,
      'creation     -> updatedFsNode.creation,
      'modification -> updatedFsNode.modification,
      'hidden       -> updatedFsNode.hidden,
      'user_id      -> updatedFsNode.owner,
      'metadata     -> FsNode.internalFormat.writes(updatedFsNode)
    )
  }

}

object FsNodeStore {

  val table: String = "fs_node"

  val pkField: String = "id"
  val ownerField: String = "user_id"
  val pathField: String = "path"
  val nameField: String = "name"
  val nodeTypeField: String = "node_type"
  val metadataField: String = "metadata"

}
