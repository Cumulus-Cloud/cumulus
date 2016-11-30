package models

import java.util.UUID

import org.joda.time.DateTime

/**
  * An abstract file system element
  */
trait FileSystemElement {
  def id: UUID
  def location: Path
  def name: String
  def creation: DateTime
  def modification: DateTime
  def creator: Account
  def permissions: Seq[Permission]

  /**
    * Check if the account have sufficient rights, i.e. is admin or have read permission
    * @param account The account to test
    * @param permission The permission to test
    * @return True if the account have the permission, false otherwise
    */
  def havePermission(account: Account, permission: String): Boolean = {
    account.isAdmin || permissions.count(p => p.accountId == account.id && p.permissions.contains(permission)) > 0
  }

}
