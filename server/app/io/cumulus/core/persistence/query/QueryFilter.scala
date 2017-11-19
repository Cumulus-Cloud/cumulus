package io.cumulus.core.persistence.query

import anorm._

trait QueryFilter {

  /**
    * Return a SQL string to be inserted into the query. This string will use the named parameters defined by the same
    * persistence filter. This SQL will always starts with the " AND " if needed. Can be empty if no inner filter is
    * defined.
    */
  def toAND: String = {
    if (filters.isEmpty)
      ""
    else
      s" AND ${filters.map(_.sql).mkString(" AND ")}"
  }

  /**
    * Return a SQL string to be inserted into the query. This string will use the named parameters defined by the same
    * persistence filter. This SQL will always starts with the " WHERE " if needed. Can be empty if no inner filter is
    * defined.
    */
  def toWHERE: String = {
    if (filters.isEmpty)
      ""
    else
      s" WHERE ${filters.map(_.sql).mkString(" AND ")}"
  }

  /**
    * The list of named parameters of the filter
    */
  def namedParameters: Seq[NamedParameter] = filters.flatMap(_.namedParameters)

  /**
    * The sequence of filters defining the filter. Each filter is defined by some SQL and its
    */
  def filters: Seq[ParameterizedSqlFilter]

}

/**
  * Filter composing a QueryFilter.
  *
  * @param sql The SQL part of the filter. Never add any data passed by the user, and use the `{ }` notation
  *            to use named parameters
  * @param namedParameters The sequence of named parameters to be used with the SQL of the filter
  */
sealed case class ParameterizedSqlFilter(sql: String, namedParameters: Seq[NamedParameter])

object ParameterizedSqlFilter {

  def apply(sql: String, namedParameter: NamedParameter): ParameterizedSqlFilter =
    ParameterizedSqlFilter(sql, Seq(namedParameter))

  def apply(sql: String, key: String, value: ParameterValue): ParameterizedSqlFilter =
    ParameterizedSqlFilter(sql, NamedParameter(key, value))

}
