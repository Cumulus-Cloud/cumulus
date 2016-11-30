package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm.SqlParser._
import anorm._
import models.{FileSystemElement, Permission}
import play.api.db.DBApi
import repositories.BaseRepository

import scala.concurrent.ExecutionContext

/**
  * Created by gvi on 30/11/16.
  */
class PermissionRepository@Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) extends BaseRepository[Permission](
  dbApi.database("default"),
  PermissionRepository.table,
  PermissionRepository.parser
) {

  import PermissionRepository._

  private[filesystem] def insert(fileSystemElement: FileSystemElement, permission: Permission)(implicit c: Connection) = {
    insertPermission(fileSystemElement, permission).execute()
  }

}

object PermissionRepository {

  val table = "permission"

  val parser = {
    get[UUID]("account_id") ~
      get[Array[String]]("permissions")  map {
        case account_id ~ permissions
          => Permission(account_id, permissions)
    }
  }

  private def insertPermission(fileSystemElement: FileSystemElement, permission: Permission) = SQL"""
     INSERT INTO #$table (
       account_id,
       directory_id,
       permissions)
     VALUES (
       ${permission.accountId}::uuid,
       ${fileSystemElement.id}::uuid,
       ${permission.permissions.toArray[String]}
     );
    """
}
