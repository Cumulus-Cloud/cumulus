package io.cumulus.models.fs

import play.api.libs.json.{Format, Json}


case class Permission(
  accountId: java.util.UUID,
  permissions: Seq[String]
)


object Permission {

  implicit val format: Format[Permission] =
    Json.format[Permission]

}
