package repositories

import javax.inject.Inject

import anorm.SqlParser._
import anorm.~
import models.Directory
import org.joda.time.DateTime
import play.api.db.DBApi

import scala.concurrent.ExecutionContext

class DirectoryRepository @Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) extends BaseRepository[Directory](
  dbApi.database("default"),
  DirectoryRepository.table,
  DirectoryRepository.parser)
{

  // TODO

}

object DirectoryRepository {

  val table = "account"

  val parser = {
    get[java.util.UUID]("id") ~
    get[String]("location") ~
    get[String]("name") ~
    get[DateTime]("creation") ~
    get[DateTime]("modification") ~
    get[java.util.UUID]("account_id") map {
      case id ~ location ~ name ~ creation ~ modification ~ creator
        => Directory(id, location, name, creation, modification, creator, Seq())
    }
  }
}
