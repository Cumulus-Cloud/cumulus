package io.cumulus.persistence.stores.filters

import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.query.{ParameterizedSqlFilter, QueryFilter}
import io.cumulus.models.user.User
import io.cumulus.persistence.stores.SessionStore._

/**
  * Filter for sessions.
  *
  * @param owner The owner of the session.
  * @param revoked if the session is revoked.
  */
case class SessionFilter(
  owner: User,
  revoked: Option[Boolean] = None
) extends QueryFilter {

  lazy val filters: Seq[ParameterizedSqlFilter] =
    Seq(
      ownerToFilter,
      revokedToFilter,
    ).flatten

  private lazy val ownerToFilter: Option[ParameterizedSqlFilter] = Some {
    ParameterizedSqlFilter(s"$ownerField = {_owner}", "_owner", owner.id)
  }

  private lazy val revokedToFilter: Option[ParameterizedSqlFilter] = revoked.map { revokedFilter =>
    ParameterizedSqlFilter(s"$metadataField ->> 'revoked' = {_revoked}", "_revoked", revokedFilter)
  }

}


