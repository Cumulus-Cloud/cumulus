package io.cumulus

import java.io.File
import java.security.Security

import _root_.controllers.AssetsComponents
import akka.actor.{ActorRef, Scheduler}
import akka.stream.{ActorMaterializer, Materializer}
import com.softwaremill.macwire._
import com.typesafe.config.{Config, ConfigFactory}
import io.cumulus.controllers._
import io.cumulus.controllers.admin.{ManagementController, UserAdminController}
import io.cumulus.controllers.utils.LoggingFilter
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.HttpErrorHandler
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.{FutureQueryRunner, QueryRunner}
import io.cumulus.core.utils.ServerWatchdog
import io.cumulus.persistence.storage.StorageEngines
import io.cumulus.persistence.storage.engines.LocalStorage
import io.cumulus.persistence.stores._
import io.cumulus.services._
import io.cumulus.services.admin.UserAdminService
import io.cumulus.stages._
import jsmessages.{JsMessages, JsMessagesFactory}
import org.bouncycastle.jce.provider.BouncyCastleProvider
import play.api._
import play.api.db.evolutions.{ClassLoaderEvolutionsReader, EvolutionsComponents}
import play.api.db.{DBComponents, Database, HikariCPComponents}
import play.api.i18n.{I18nComponents, MessagesApi}
import play.api.libs.mailer.MailerComponents
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import router.Routes

import scala.concurrent.{ExecutionContextExecutor, Future}

/**
  * Create the components of the Cumulus web application.
  * @param context The context of the app.
  */
class CumulusComponents(
  context: ApplicationLoader.Context,
  watchdog: ServerWatchdog
) extends BuiltInComponentsFromContext(context)
  with I18nComponents
  with AssetsComponents
  with AhcWSComponents
  with DBComponents
  with HikariCPComponents
  with MailerComponents
  with EvolutionsComponents {

  // List of supported ciphers
  implicit lazy val ciphers: Ciphers =
    Ciphers(
      AESCipherStage
    )

  // List of supported compressors
  implicit lazy val compressors: Compressions =
    Compressions(
      GzipStage,
      DeflateStage
    )

  // List of metadata extractors available
  implicit lazy val metadataExtractors: MetadataExtractors =
    MetadataExtractors(
      ImageMetadataExtractor,
      PDFDocumentMetadataExtractor
    )

  // List of thumbnail generator available
  implicit lazy val thumbnailGenerators: ThumbnailGenerators =
    ThumbnailGenerators(
      ImageThumbnailGenerator,
      PDFDocumentThumbnailGenerator
    )

  // List of storage engine available
  implicit lazy val storageEngines: StorageEngines =
    StorageEngines(
      LocalStorage
    )

  // Security provider
  Security.addProvider(new BouncyCastleProvider)

  // Compile time generated router
  val routerPrefix: String = "/"
  lazy val router: Routes  = wire[Routes]

  override implicit lazy val configuration: Configuration =
    context.initialConfiguration ++ Configuration(ConfigFactory.parseFile(new File("conf/override.conf")))

  implicit lazy val config: Config     = configuration.underlying // for MailerComponents
  implicit lazy val settings: Settings = wire[Settings]

  // SQL evolutions
  override lazy val evolutionsReader = new ClassLoaderEvolutionsReader
  applicationEvolutions // Access the lazy val to trigger evolutions

  // Database & QueryMonad to access DB
  implicit lazy val database: Database = dbApi.database("default")
  implicit lazy val queryRunner: QueryRunner[Future] = new FutureQueryRunner(CumulusDB(database), databaseEc)

  // Execution contexts
  implicit lazy val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  lazy val databaseEc: ExecutionContextExecutor         = actorSystem.dispatchers.lookup("db-context")
  lazy val tasksEc: ExecutionContextExecutor            = actorSystem.dispatchers.lookup("task-context")
  lazy val scheduler: Scheduler                         = actorSystem.scheduler

  override implicit lazy val materializer: Materializer = ActorMaterializer()(actorSystem)

  // Implicit message + JS messages
  implicit lazy val implicitMessagesApi: MessagesApi = messagesApi
  lazy val jsMessages: JsMessages                    = wire[JsMessagesFactory].all

  // HTTP components
  lazy val loggingFilter: LoggingFilter                = wire[LoggingFilter]
  override lazy val httpFilters: Seq[EssentialFilter]  = Seq(loggingFilter)
  override lazy val httpErrorHandler: HttpErrorHandler = wire[HttpErrorHandler]

  // Stores
  lazy val userStore: UserStore       = wire[UserStore]
  lazy val fsNodeStore: FsNodeStore   = wire[FsNodeStore]
  lazy val sharingStore: SharingStore = wire[SharingStore]
  lazy val sessionStore: SessionStore = wire[SessionStore]
  lazy val eventStore: EventStore     = wire[EventStore]

  // Services
  lazy val userService: UserService       = wire[UserService]
  lazy val fsNodeService: FsNodeService   = wire[FsNodeService]
  lazy val storageService: StorageService = wire[StorageService]
  lazy val sharingService: SharingService = wire[SharingService]
  lazy val sessionService: SessionService = wire[SessionService]
  lazy val eventService: EventService     = wire[EventService]
  lazy val taskService: TaskService       = wire[TaskService]
  lazy val mailService: MailService       = wire[MailService]

  // Admin services
  lazy val userServiceAdmin: UserAdminService = wire[UserAdminService]

  // Controllers
  lazy val homeController: HomeController                 = wire[HomeController]
  lazy val managementController: ManagementController     = wire[ManagementController]
  lazy val userController: UserController                 = wire[UserController]
  lazy val fsController: FileSystemController             = wire[FileSystemController]
  lazy val sharingController: SharingPublicController     = wire[SharingPublicController]
  lazy val sharingManagementController: SharingController = wire[SharingController]
  lazy val assetController: Assets                        = wire[Assets]

  // Admin controllers
  lazy val userAdminController: UserAdminController = wire[UserAdminController]

  // Actors
  lazy val taskExecutor: ActorRef = actorSystem.actorOf(TaskExecutor.props(taskService)(executionContext, settings), "TaskExecutor")

  //import scala.concurrent.duration._

  // TODO from conf
  //actorSystem.scheduler.schedule(30 second, 60 seconds, taskExecutor, TaskExecutor.ScheduledRun)

}
