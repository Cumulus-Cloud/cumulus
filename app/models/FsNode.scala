package models

import java.util.UUID

import org.joda.time.DateTime

/**
  * An abstract file system element
  * @param id Its unique UUID
  * @param location The location if composed of the path to the content of the directory (parent location + / + name)
  * @param name The name of the directory, which is actually the last part of its path
  * @param creation The creation date
  * @param modification The last modification date
  * @param creator The creator of the directory
  * @param permissions The permissions
  */
case class FsNode(
  id: UUID,
  location: Path,
  name: String,
  nodeType: String, // TODO custom case class ?
  creation: DateTime,
  modification: DateTime,
  creator: Account,
  permissions: Seq[Permission]
) {

  /**
    * Check if the node is a file
    *
    * @return True if the node is a file, false otherwise
    */
  def isFile: Boolean = {
    nodeType == "file"
  }

  /**
    * Check if the node is a directory
    *
    * @return True if the node is a directory, false otherwise
    */
  def isDirectory: Boolean = {
    nodeType == "directory"
  }

  /**
    * Check if the node is the root directory, base on the location being an empty sequence
    * @return True if the node is the root directory, false otherwise
    */
  def isRoot: Boolean = {
    location.value.isEmpty
  }

  /**
    * Check if the account have sufficient rights, i.e. is admin or have read permission
    * @param account    The account to test
    * @param permission The permission to test
    * @return True if the account have the permission, false otherwise
    */
  def havePermission(account: Account, permission: String): Boolean = {
    account.isAdmin || permissions.count(p => p.accountId == account.id && p.permissions.contains(permission)) > 0
  }
}

object FsNode {

  def initFrom(location: String, nodeType: String, creator: Account): FsNode = FsNode(
    UUID.randomUUID(),
    location,
    location.split("/").last,
    nodeType,
    DateTime.now(),
    DateTime.now(),
    creator,
    permissions = Seq(Permission(creator.id, Seq("read", "write")))
  )

}
