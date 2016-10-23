package repositories

import java.util.UUID
import javax.inject.{Singleton, Inject}

import models.Account

import anorm._
import anorm.SqlParser._
import anorm.JodaParameterMetaData._
import org.joda.time.DateTime

import play.api.db.DBApi
import scala.concurrent.ExecutionContext

import utils.EitherUtils._

@Singleton
class AccountRepository @Inject()(
  dbApi: DBApi
)(
  implicit ec: ExecutionContext
) extends BaseRepository[Account](
  dbApi.database("default"),
  AccountRepository.table,
  AccountRepository.parser)
{

  import AccountRepository._

  def getByLogin(login: String): Option[Account] =
    db.withConnection { implicit c =>
      selectAccountByLogin(login).as(parser.singleOpt)
  }

  def getByMail(mail: String): Option[Account] =
    db.withConnection { implicit c =>
      selectAccountByMail(mail).as(parser.singleOpt)
  }

  def insert(account: Account): Either[ValidationError, Account] =
    db.withTransaction { implicit c =>
      for {
        byLogin <- selectAccountByLogin(account.login).as(parser.singleOpt) match {
          case Some(_) => Left(ValidationError("login", "Login already used"))
          case None => Right(account)
        }
        byEmail <- selectAccountByMail(account.mail).as(parser.singleOpt) match {
          case Some(_) => Left(ValidationError("mail", "Mail already used"))
          case None => Right(account)
        }
      } yield {
        insertAccount(account).execute()
        account
      }
  }
}

object AccountRepository {

  val table = "account"

  val parser = {
    get[UUID]("id") ~
    get[String]("mail") ~
    get[String]("login") ~
    get[String]("password") ~
    get[DateTime]("creation") ~
    get[Array[String]]("roles") ~
    get[Option[String]]("home") map {
      case id ~ mail ~ login ~ password ~ creation ~ roles ~ home
        => Account(id, mail, login, password, creation, roles, home)
    }
  }

  private def selectAccountByLogin(login: String) = SQL"""
     SELECT *
     FROM #$table
     WHERE LOWER(login) = LOWER($login);
  """

  private def selectAccountByMail(mail: String) = SQL"""
     SELECT *
     FROM #$table
     WHERE mail = $mail;
  """

  private def insertAccount(account: Account) = SQL"""
     INSERT INTO #$table (
       id,
       mail,
       login,
       password,
       creation,
       roles)
     VALUES (
       ${account.id}::uuid,
       ${account.mail},
       ${account.login},
       ${account.password},
       ${account.creation},
       ${account.roles.toArray[String]}
     );
    """

}
