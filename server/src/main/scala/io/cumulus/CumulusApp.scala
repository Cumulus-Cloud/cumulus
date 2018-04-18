package io.cumulus

import scala.concurrent.ExecutionContextExecutor

import _root_.controllers.AssetsComponents
import akka.actor.ActorRef
import akka.stream.{ActorMaterializer, Materializer}
import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
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
import jsmessages.JsMessagesFactory
import play.api
import play.api._
import play.api.db.{DBComponents, Database, HikariCPComponents}
import play.api.i18n.MessagesApi
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import play.core.server.AkkaHttpServerComponents

import router.Routes

object CumulusApp extends App {

  val server =
    new AkkaHttpServerComponents {
      override def application: api.Application = {
        // Create the default context of the application
        val context: ApplicationLoader.Context = ApplicationLoader.createContext(Environment.simple())

        // Init the logger
        LoggerConfigurator(context.environment.classLoader).foreach {
          _.configure(context.environment)
        }

        // Instantiate all the components of the application
        new CumulusComponents(context).application
      }
    }

  server.server

}

class CumulusComponents(
  context: ApplicationLoader.Context
) extends BuiltInComponentsFromContext(context)
  with HoconI18nComponents
  with AssetsComponents
  with AhcWSComponents
  with DBComponents
  with HikariCPComponents {

  // with MailerComponents { TODO
  // with EvolutionsComponents { TODO

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
  lazy val router =
    new Routes(
      httpErrorHandler,
      homeController,
      userController,
      fsController,
      sharingManagementController,
      sharingController,
      assetController
    )

  // Configurations
  implicit lazy val playConfig: Configuration = configuration
  implicit lazy val config: Config            = configuration.underlying // for MailerComponents
  implicit lazy val settings: Settings        = new Settings(configuration)

  // Access the lazy val to trigger evolutions
  // applicationEvolutions TODO

  // Database & QueryMonad to access DB
  implicit lazy val database: Database = dbApi.database("default")
  implicit lazy val welcomeQB: QueryBuilder[CumulusDB] = QueryBuilder(CumulusDB(database), databaseEc)

  // executionContexts
  implicit val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  val databaseEc: ExecutionContextExecutor         = actorSystem.dispatchers.lookup("db-context")
  val tasksEc: ExecutionContextExecutor            = actorSystem.dispatchers.lookup("task-context")

  override implicit lazy val materializer: Materializer = ActorMaterializer()(actorSystem)

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
  lazy val storageService: StorageService = new StorageService(fsNodeService, chunkRemover)
  lazy val sharingService: SharingService = new SharingService(userStore, fsNodeStore, sharingStore)

  // Controllers
  lazy val homeController: HomeController                           = new HomeController(controllerComponents)
  lazy val userController: UserController                           = new UserController(controllerComponents, userService)
  lazy val fsController: FileSystemController                       = new FileSystemController(controllerComponents, fsNodeService, storageService, sharingService)
  lazy val sharingController: SharingController                     = new SharingController(controllerComponents, sharingService, storageService)
  lazy val sharingManagementController: SharingManagementController = new SharingManagementController(controllerComponents, sharingService)
  lazy val assetController: Assets                                  = new Assets(context.environment, assetsMetadata, httpErrorHandler, jsMessageFactory.all, controllerComponents)

  // Actors
  lazy val chunkRemover: ActorRef = actorSystem.actorOf(ChunkRemover.props(storageEngines), "ChunkRemover")

}
