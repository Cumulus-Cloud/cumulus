package io.cumulus.persistence

import java.sql.Connection

import io.cumulus.Settings
import org.flywaydb.core.Flyway
import org.flywaydb.core.api.configuration.ClassicConfiguration
import scalikejdbc.{ConnectionPool, ConnectionPoolSettings}

import scala.util.control.NonFatal



class PooledDatabase(val name: String, settings: Settings) extends Database {

  // Init the JDBC driver
  Class.forName("org.postgresql.Driver")

  // Do any migration needed
  doDatabaseMigration()

  // Create the connection pool
  private val connectionPool = initConnectionPool()

  def getConnection(autocommit: Boolean): Connection = {
    val connection = connectionPool.borrow()
    try {
      connection.setAutoCommit(autocommit)
    } catch {
      case NonFatal(e) =>
        connection.close()
        throw e
    }
    connection
  }

  def shutdown(): Unit = {
    try {
      connectionPool.close()
    } catch {
      case NonFatal(_) =>
        () // Ignore
    }
  }

  /**
   * Initialize the connection pool of the database, using the provided configuration.
   */
  private def initConnectionPool(): ConnectionPool = {
    // Load the pool settings from the settings
    val poolSettings =
      ConnectionPoolSettings(
        initialSize = settings.database.pool.minSize,
        maxSize = settings.database.pool.maxSize,
        connectionTimeoutMillis = settings.database.pool.connectionTimeout
      )

    // Create the connection pool from the defined settings
    ConnectionPool(
      settings.database.url,
      settings.database.user,
      settings.database.password,
      poolSettings
    )
  }


  /**
   * Do the database migration, using FlyWay.
   */
  private def doDatabaseMigration(): Unit = {
    val flywayConfiguration = new ClassicConfiguration()

    flywayConfiguration
      .setDataSource(
        settings.database.url,
        settings.database.user,
        settings.database.password
      )

    flywayConfiguration
      .setLocations()

    new Flyway(flywayConfiguration).migrate()
    ()
  }

}
