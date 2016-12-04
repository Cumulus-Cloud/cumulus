package repositories.filesystem

import java.sql.Connection
import java.util.UUID
import javax.inject.Inject

import anorm.SqlParser._
import anorm._
import models.{FsNode, Permission}
import play.api.db.DBApi

import scala.concurrent.ExecutionContext

class PermissionRepository@Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) {

  import PermissionRepository._

  private[filesystem] def insertNonAtomic(fileSystemElement: FsNode, permission: Permission)(implicit c: Connection) = {
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

  private def insertPermission(fileSystemElement: FsNode, permission: Permission) = SQL"""
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
