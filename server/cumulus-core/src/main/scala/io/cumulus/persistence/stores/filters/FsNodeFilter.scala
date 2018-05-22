package io.cumulus.persistence.stores.filters

import anorm.NamedParameter
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.{ParameterizedSqlFilter, QueryFilter}
import io.cumulus.models.Path
import io.cumulus.models.fs.FsNodeType
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.FsNodeStore._

/**
  * Filter for a filesystem node.
  *
  * @param likeName The name to look for.
  * @param parent The parent of the node.
  * @param nodeType The type of node (optional).
  * @param mimeType The mime type of the node (optional, only for files).
  * @param owner The owner of the node.
  */
case class FsNodeFilter(
  likeName: String,
  parent: Path,
  nodeType: Option[FsNodeType],
  mimeType: Option[String],
  owner: User
) extends QueryFilter {

  lazy val filters: Seq[ParameterizedSqlFilter] =
    Seq(
      ownerToFilter,
      parentToFilter,
      nodeTypeToFilter,
      mimeTypeToFilter,
      nameToFilter
    ).flatten

  private lazy val nameToFilter: Option[ParameterizedSqlFilter] = Some(
    ParameterizedSqlFilter(s"""
      (
        dmetaphone($nameField) = dmetaphone({_name}) OR
        levenshtein($nameField, {_name}) < 3 OR
        name LIKE {_nameLike}
      )
    """.stripMargin, Seq(NamedParameter("_name", likeName), NamedParameter("_nameLike", s"%$likeName%")))
  )

  private lazy val parentToFilter: Option[ParameterizedSqlFilter] = Some {
    val regex = s"^${parent.toString}"
    ParameterizedSqlFilter(s"$pathField ~ {_path}", "_path", regex)
  }

  private lazy val nodeTypeToFilter: Option[ParameterizedSqlFilter] = nodeType.map { t =>
    ParameterizedSqlFilter(s"$nodeTypeField = {_nodeType}", "_nodeType", t)
  }

  private lazy val mimeTypeToFilter: Option[ParameterizedSqlFilter] = mimeType.map { t =>
    val regex = s"^$t"
    ParameterizedSqlFilter(s"$metadataField ->> 'mimeType' ~ {_mimeType}", "_mimeType", regex)
  }

  private lazy val ownerToFilter: Option[ParameterizedSqlFilter] = Some {
    ParameterizedSqlFilter(s"$ownerField = {_owner}", "_owner", owner.id)
  }

}
