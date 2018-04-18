package io.cumulus.core.persistence

import play.api.db.{Database => PlayDB}

sealed trait Database {
  val getDB: PlayDB = this match {
    case CumulusDB(db) => db
  }
}

case class CumulusDB(db: PlayDB) extends Database
