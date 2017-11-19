package io.cumulus.persistence.stores

import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.{ParameterizedSqlFilter, QueryFilter}
import io.cumulus.models.{Path, User}
import io.cumulus.persistence.stores.FsNodeStore._

case class FsNodeFilter(
  owner: User,
  path: Option[Path],
  parentPath: Option[Path]
) extends QueryFilter {

  override def filters = Seq(
    ownerToFilter,
    pathToFilter,
    parentPathToFilter
  ).flatten

  private lazy val ownerToFilter: Option[ParameterizedSqlFilter] = Some(
    ParameterizedSqlFilter(s"$ownerField = {_owner}", "_owner", owner.id)
  )

  private lazy val pathToFilter: Option[ParameterizedSqlFilter] = path.map( p =>
    ParameterizedSqlFilter(s"$pathField = {_path}", "_path", p.toString)
  )

  private lazy val parentPathToFilter: Option[ParameterizedSqlFilter] = parentPath.map( p =>
    // TODO (with regex)
    ???
  )

}

object FsNodeFilter {

  def byLocation(path: Path)(implicit owner: User): FsNodeFilter =
    FsNodeFilter(
      owner = owner,
      path = Some(path),
      parentPath = None
    )

  def byParentPath(path: Path)(implicit owner: User): FsNodeFilter =
    FsNodeFilter(
      owner = owner,
      path = None,
      parentPath = Some(path)
    )

}