package models

/**
  * Permissions, for either a file or a directory
  * @param accountId The id of the account
  * @param permissions The rights of the account
  */
case class Permission(
  accountId: java.util.UUID,
  permissions: Seq[String]
)