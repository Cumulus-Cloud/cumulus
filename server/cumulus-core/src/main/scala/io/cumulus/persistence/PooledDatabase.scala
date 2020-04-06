package io.cumulus.persistence

import java.sql.Connection

import org.flywaydb.core.Flyway
import org.flywaydb.core.api.configuration.ClassicConfiguration
import scalikejdbc.{ConnectionPool, ConnectionPoolSettings}

import scala.concurrent.duration.FiniteDuration
import scala.util.control.NonFatal



class PooledDatabase(val name: String, settings: DatabaseSettings) extends Database {

  // Init the JDBC driver
  Class.forName(settings.driver)

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
        initialSize = settings.pool.minSize,
        maxSize = settings.pool.maxSize,
        connectionTimeoutMillis = settings.pool.connectionTimeout.toMillis
      )

    // Create the connection pool from the defined settings
    ConnectionPool(
      settings.url,
      settings.user,
      settings.password,
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
        settings.url,
        settings.user,
        settings.password
      )

    flywayConfiguration
      .setLocations()

    new Flyway(flywayConfiguration).migrate()
    ()
  }

}

case class DatabaseSettings(
  driver: String,
  url: String,
  user: String ,
  password: String,
  pool: DatabasePoolSettings
)

case class DatabasePoolSettings(
  minSize: Int,
  maxSize: Int,
  connectionTimeout: FiniteDuration
)
