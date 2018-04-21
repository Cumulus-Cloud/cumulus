package io.cumulus

import scala.concurrent.ExecutionContextExecutor

import _root_.controllers.AssetsComponents
import akka.actor.{ActorRef, Scheduler}
import akka.stream.{ActorMaterializer, Materializer}
import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
import com.softwaremill.macwire._
import com.typesafe.config.Config
import io.cumulus.controllers._
import io.cumulus.controllers.utils.{Assets, LoggingFilter}
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.HttpErrorHandler
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.persistence.services.{FsNodeService, SharingService, StorageService, UserService}
import io.cumulus.persistence.storage.engines.LocalStorage
import io.cumulus.persistence.storage.{ChunkRemover, StorageEngines}
import io.cumulus.persistence.stores.{FsNodeStore, SharingStore, UserStore}
import io.cumulus.stages._
import jsmessages.{JsMessages, JsMessagesFactory}
import play.api
import play.api._
import play.api.db.evolutions.EvolutionsComponents
import play.api.db.{DBComponents, Database, HikariCPComponents}
import play.api.i18n.MessagesApi
import play.api.libs.mailer.MailerComponents
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import play.core.server.{AkkaHttpServerComponents, ServerConfig}

import router.Routes

/**
  * Create an embed (programmatically managed) play server using the Cumulus web app components and a default context.
  */
class CumulusServer extends AkkaHttpServerComponents {

  val env = Environment.simple()

  val port    = Configuration.load(env).get[Int]("play.http.port")
  val address = Configuration.load(env).get[String]("play.http.address")
  val modeRaw = Configuration.load(env).get[String]("play.http.mode")

  val mode = modeRaw.toUpperCase match {
    case "DEV"  => Mode.Dev
    case "TEST" => Mode.Test
    case "PROD" => Mode.Prod
    case _      => throw new Exception(s"Invalid mode type '$modeRaw' ; can only be 'DEV', 'TEST' or 'PROD'")
  }

  override lazy val serverConfig =
    ServerConfig(
      port = Some(port),
      mode = mode,
      address = address
    )

  val application: api.Application = {
    // Create the default context of the application
    val context: ApplicationLoader.Context = ApplicationLoader.createContext(env)

    // Init the logger
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    // Instantiate all the components of the application
    new CumulusComponents(context).application
  }
}

/**
  * Create the components of the Cumulus web application.
  * @param context The context of the app.
  */
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

  // List of supported ciphers
  implicit val ciphers = Ciphers(Seq(
    AESCipherStage
  ))

  // List of supported compressors
  implicit val compressors = Compressions(Seq(
    GzipStage,
    DeflateStage
  ))

  // List of metadata extractors available
  implicit val metadataExtractors = MetadataExtractors(Seq(
    ImageMetadataExtractor,
    PDFDocumentMetadataExtractor
  ))

  // List of thumbnail generator available
  implicit val thumbnailGenerators = ThumbnailGenerators(Seq(
    ImageThumbnailGenerator,
    PDFDocumentThumbnailGenerator
  ))

  // List of storage engine available
  implicit val storageEngines = StorageEngines(Seq(
    LocalStorage
  ))

  // Compile time generated router
  val routerPrefix: String = "/"
  lazy val router: Routes  = wire[Routes]

  // Configurations
  implicit lazy val playConfig: Configuration = configuration
  implicit lazy val config: Config            = configuration.underlying // for MailerComponents
  implicit lazy val settings: Settings        = wire[Settings]

  // Access the lazy val to trigger evolutions
  applicationEvolutions

  // Database & QueryMonad to access DB
  implicit lazy val database: Database = dbApi.database("default")
  implicit lazy val welcomeQB: QueryBuilder[CumulusDB] = QueryBuilder(CumulusDB(database), databaseEc)

  // executionContexts
  implicit lazy val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  lazy val databaseEc: ExecutionContextExecutor         = actorSystem.dispatchers.lookup("db-context")
  lazy val tasksEc: ExecutionContextExecutor            = actorSystem.dispatchers.lookup("task-context")
  lazy val scheduler: Scheduler                         = actorSystem.scheduler

  override implicit lazy val materializer: Materializer = ActorMaterializer()(actorSystem)

  // Override messagesApi to use Hocon config
  override implicit lazy val messagesApi: MessagesApi = wire[HoconMessagesApiProvider].get
  lazy val jsMessages: JsMessages                     = wire[JsMessagesFactory].all

  // HTTP components
  lazy val loggingFilter: LoggingFilter                = wire[LoggingFilter]
  override lazy val httpFilters: Seq[EssentialFilter]  = Seq(loggingFilter)
  override lazy val httpErrorHandler: HttpErrorHandler = wire[HttpErrorHandler]

  // Stores
  lazy val userStore: UserStore       = wire[UserStore]
  lazy val fsNodeStore: FsNodeStore   = wire[FsNodeStore]
  lazy val sharingStore: SharingStore = wire[SharingStore]

  // Services
  lazy val userService: UserService       = wire[UserService]
  lazy val fsNodeService: FsNodeService   = wire[FsNodeService]
  lazy val storageService: StorageService = wire[StorageService]
  lazy val sharingService: SharingService = wire[SharingService]

  // Controllers
  lazy val homeController: HomeController                 = wire[HomeController]
  lazy val userController: UserController                 = wire[UserController]
  lazy val fsController: FileSystemController             = wire[FileSystemController]
  lazy val sharingController: SharingPublicController     = wire[SharingPublicController]
  lazy val sharingManagementController: SharingController = wire[SharingController]
  lazy val assetController: Assets                        = wire[Assets]

  // Actors
  lazy val chunkRemover: ActorRef = actorSystem.actorOf(ChunkRemover.props(storageEngines), "ChunkRemover")

}
