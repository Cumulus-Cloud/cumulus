package io.cumulus.persistence.stores

import java.util.UUID

import anorm._
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.anorm.AnormSupport._
import io.cumulus.core.persistence.anorm.{AnormPKOperations, AnormRepository, AnormSupport}
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.models.task.Task
import io.cumulus.persistence.stores.TaskStore._

class TaskStore(
  implicit val qb: QueryBuilder[CumulusDB]
) extends AnormPKOperations[Task, CumulusDB, UUID] with AnormRepository[Task, CumulusDB] {

  val table: String   = TaskStore.table
  val pkField: String = TaskStore.pkField

  val rowParser: RowParser[Task] = {
    implicit val sessionColumn: Column[Task] =
      AnormSupport.column[Task](Task.format)

    SqlParser.get[Task](metadataField)
  }

  def getParams(task: Task): Seq[NamedParameter] = {
    Seq(
      'id        -> task.id,
      'status    -> task.status,
      'recurrent -> task.recurrent,
      'metadata  -> Task.format.writes(task)
    )
  }

}

object TaskStore {

  val table: String = "cumulus_task"

  val pkField: String        = "id"
  val statusField: String    = "status"
  val recurrentField: String = "recurrent"
  val metadataField: String  = "metadata"

}








