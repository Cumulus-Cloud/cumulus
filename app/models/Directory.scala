package models

import org.joda.time.DateTime

case class Directory(
  id: Option[String],
  location: String,
  name: String,
  creation: Option[DateTime],
  modification: Option[DateTime],
  creator: String
  //permissions: Seq[()]
)
