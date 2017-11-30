import scala.concurrent.ExecutionContextExecutor

import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
import com.typesafe.config.Config
import controllers.AssetsComponents
import io.cumulus.controllers.utils.{Assets, LoggingFilter}
import io.cumulus.controllers.{FileSystemController, HomeController, SharingController, UserController}
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.HttpErrorHandler
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.persistence.services.{FsNodeService, SharingService, UserService}
import io.cumulus.persistence.storage.{LocalStorageEngine, StorageEngine}
import io.cumulus.persistence.stores.{FsNodeStore, SharingStore, UserStore}
import io.cumulus.stages._
import jsmessages.JsMessagesFactory
import play.api._
import play.api.db.evolutions.EvolutionsComponents
import play.api.db.{DBComponents, Database, HikariCPComponents}
import play.api.i18n.MessagesApi
import play.api.libs.mailer.MailerComponents
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import play.api.routing.Router

import router.Routes

class CumulusLoader extends ApplicationLoader {

  def load(context: ApplicationLoader.Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }
    new CumulusComponents(context).application
  }

}

class CumulusComponents(
  context: ApplicationLoader.Context
) extends BuiltInComponentsFromContext(context)
  with HoconI18nComponents
  with AssetsComponents
  with AhcWSComponents
  with DBComponents
  with HikariCPComponents
  with MailerComponents
  with EvolutionsComponents {

  implicit val ciphers = Ciphers(Map(
    AESCipherStage.name -> AESCipherStage
  ))

  implicit val compressors = Compressions(Map(
    GzipStage.name    -> GzipStage,
    DeflateStage.name -> DeflateStage
  ))

  lazy val router: Router = new Routes(
    httpErrorHandler,
    homeController,
    userController,
    fsController,
    sharingController,
    assetController
  )

  // Configurations
  implicit val config: Config      = configuration.underlying // for MailerComponents
  implicit val settings: Settings = new Settings(configuration)

  // Access the lazy val to trigger evolutions
  applicationEvolutions

  // Database & QueryMonad to access DB
  implicit lazy val database: Database = dbApi.database("default")
  implicit lazy val welcomeQB: QueryBuilder[CumulusDB] = QueryBuilder(CumulusDB(database), databaseEc)

  // executionContexts
  implicit val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  val databaseEc: ExecutionContextExecutor         = actorSystem.dispatcher //s.lookup("db-context")

  // Override messagesApi to use Hocon config
  override lazy val messagesApi: MessagesApi = new HoconMessagesApiProvider(environment, configuration, langs, httpConfiguration).get
  val jsMessageFactory = new JsMessagesFactory(messagesApi)

  // HTTP components
  lazy val loggingFilter: LoggingFilter = new LoggingFilter()
  override lazy val httpFilters: Seq[EssentialFilter]  = Seq(loggingFilter)
  override lazy val httpErrorHandler: HttpErrorHandler = new HttpErrorHandler()(messagesApi)

  // Stores
  lazy val userStore: UserStore       = new UserStore
  lazy val fsNodeStore: FsNodeStore   = new FsNodeStore
  lazy val sharingStore: SharingStore = new SharingStore

  // Services
  lazy val userService: UserService       = new UserService(userStore, fsNodeStore)
  lazy val fsNodeService: FsNodeService   = new FsNodeService(fsNodeStore, sharingStore)
  lazy val sharingService: SharingService = new SharingService(userStore, fsNodeStore, sharingStore)

  // Storage engine
  lazy val storageEngine: StorageEngine = new LocalStorageEngine()


  // Controllers
  lazy val homeController: HomeController       = new HomeController(controllerComponents)
  lazy val userController: UserController       = new UserController(controllerComponents, userService)
  lazy val fsController: FileSystemController   = new FileSystemController(controllerComponents, fsNodeService, sharingService, storageEngine)
  lazy val sharingController: SharingController = new SharingController(controllerComponents, sharingService, storageEngine)
  lazy val assetController: Assets              = new Assets(context.environment, assetsMetadata, httpErrorHandler, jsMessageFactory.all, controllerComponents)

}
