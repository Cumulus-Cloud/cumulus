package repositories

import java.util.UUID

import anorm._
import org.joda.time.DateTime
import play.api.db.Database
import play.api.libs.json.{Json, JsValue, JsPath, Writes}

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

// Easy to use validation error for the repositories
case class ValidationError(field: String, errors: Seq[String])

object ValidationError {

  def apply(field: String, error: String): ValidationError = ValidationError(field, Seq(error))

  implicit val validationErrorWrites = new Writes[ValidationError] {
    def writes(validationError: ValidationError): JsValue = {
      Json.obj(validationError.field -> validationError.errors)
    }
  }
}
