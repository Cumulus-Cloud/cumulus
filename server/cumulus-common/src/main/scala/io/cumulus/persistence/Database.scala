package io.cumulus.persistence

import java.sql.Connection

import scala.util.control.{ControlThrowable, NonFatal}


abstract class Database {

  def name: String

  def getConnection(autocommit: Boolean): Connection

  def getConnection: Connection =
    getConnection(autocommit = true)

  def withConnection[A](block: Connection => A): A =
    withConnection(autocommit = true)(block)

  def withConnection[A](autocommit: Boolean)(block: Connection => A): A = {
    val connection = getConnection(autocommit)
    try {
      block(connection)
    } finally {
      connection.close()
    }
  }

  def withTransaction[A](block: Connection => A): A = {
    withConnection(autocommit = false) { connection =>
      try {
        val r = block(connection)
        connection.commit()
        r
      } catch {
        case e: ControlThrowable =>
          connection.commit()
          throw e
        case NonFatal(e) =>
          connection.rollback()
          throw e
      }
    }
  }

  def withTransaction[A](isolationLevel: Int)(block: Connection => A): A = {
    withConnection(autocommit = false) { connection =>
      val oldIsolationLevel = connection.getTransactionIsolation
      try {
        connection.setTransactionIsolation(isolationLevel)
        val r = block(connection)
        connection.commit()
        r
      } catch {
        case e: ControlThrowable =>
          connection.commit()
          throw e
        case NonFatal(e) =>
          connection.rollback()
          throw e
      } finally {
        connection.setTransactionIsolation(oldIsolationLevel)
      }
    }
  }

  def shutdown(): Unit

}
