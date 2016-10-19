package repositories

import java.util.UUID

import anorm._
import play.api.db.Database

class BaseRepository[A](
  val db: Database,
  val table: String,
  val parser: RowParser[A]
) {

  // Get an element by its UUID
  def getByUUID(uuid: UUID): Option[A] =
    db.withConnection { implicit c =>
      selectByUUID(uuid).as(parser.singleOpt)
    }

  // Get all the elements
  def getAll: Seq[A] =
    db.withConnection { implicit c =>
      selectAll.as(parser*)
    }

  // Remove an element by its UUID
  def removeByUUID(uuid: UUID) =
    db.withConnection { implicit c =>
      deleteByUUID(uuid).execute()
    }

  protected def selectByUUID(uuid: UUID) = SQL"""
       SELECT * FROM #$table WHERE #$table.id = $uuid:uuid;
    """

  protected def selectAll = SQL"""
       SELECT * FROM #$table;
    """

  protected def deleteByUUID(uuid: UUID) = SQL"""
       DELETE FROM #$table WHERE #$table.id = $uuid:uuid;
    """
}

