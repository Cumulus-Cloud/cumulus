package io.cumulus.persistence.stores.filters

import io.cumulus.persistence.query.{ParameterizedSqlFilter, QueryFilter}
import io.cumulus.persistence.stores.UserStore._

/**
  * Filter for a filesystem node.
  */
case class UserFilter(
  login: Option[String] = None,
  email: Option[String] = None
) extends QueryFilter {

  lazy val filters: Seq[ParameterizedSqlFilter] =
    Seq(
      loginToFilter,
      emailToFilter,
    ).flatten

  private lazy val loginToFilter: Option[ParameterizedSqlFilter] = login.map { loginFilter =>
    // TODO search with regex
    ParameterizedSqlFilter(s"$loginField = {_login}", "_login", loginFilter)
  }

  private lazy val emailToFilter: Option[ParameterizedSqlFilter] = email.map { emailFilter =>
    // TODO search with regex
    ParameterizedSqlFilter(s"$emailField = {_email}", "_email", emailFilter)
  }

}


