package io.cumulus

import java.security.Security

import akka.actor.{ActorRef, ActorSystem, Scheduler}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.stream.{ActorMaterializer, Materializer}
import com.softwaremill.macwire._
import com.typesafe.config.ConfigFactory
import io.cumulus.controllers.api.admin.UserAdminController
import io.cumulus.controllers.api._
import io.cumulus.controllers.app.AppController
import io.cumulus.i18n._
import io.cumulus.persistence.query.{FutureQueryRunner, QueryRunner}
import io.cumulus.persistence.storage.StorageEngines
import io.cumulus.persistence.storage.engines.LocalStorage
import io.cumulus.persistence.stores._
import io.cumulus.persistence.{Database, PooledDatabase}
import io.cumulus.services._
import io.cumulus.services.admin.UserAdminService
import io.cumulus.stages._
import org.bouncycastle.jce.provider.BouncyCastleProvider

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.language.{implicitConversions, postfixOps}



object Main extends App with Logging {

  val langs: Seq[Lang] = Seq(
    Lang("en"),
    Lang("fr")
  )

  // Load the configuration
  implicit lazy val configuration: Configuration =
    Configuration(ConfigFactory.systemEnvironment().withFallback(ConfigFactory.load()))

  // Derive the settings from the loaded configuration
  implicit lazy val settings: Settings = wire[Settings]

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

  // Database & QueryMonad to access DB
  implicit lazy val database: Database = new PooledDatabase("default", settings)
  implicit lazy val queryRunner: QueryRunner[Future] = new FutureQueryRunner(database, databaseEc)

  // Execution contexts
  implicit val actorSystem: ActorSystem                 = ActorSystem("cumulus-server")
  implicit lazy val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  lazy val databaseEc: ExecutionContextExecutor         = actorSystem.dispatchers.lookup("db-context")
  lazy val tasksEc: ExecutionContextExecutor            = actorSystem.dispatchers.lookup("task-context")
  lazy val scheduler: Scheduler                         = actorSystem.scheduler

  implicit lazy val materializer: Materializer = ActorMaterializer()(actorSystem)

  lazy val messageProvider: MessagesProvider = HoconMessagesProvider.at("langs")
  implicit lazy val messages: Messages       = wire[Messages]

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
  lazy val mailService: MailService       = ??? // TODO wire[MailService]

  // Admin services
  lazy val userServiceAdmin: UserAdminService = wire[UserAdminService]

  // Controllers
  lazy val fileSystemController: FileSystemController = wire[FileSystemController]
  lazy val sharingController: SharingController = wire[SharingController]
  lazy val sharingPublicController: SharingPublicController = wire[SharingPublicController]
  lazy val userController: UserController = wire[UserController]
  lazy val userAdminController: UserAdminController = wire[UserAdminController]
  lazy val apiController: ApiController = wire[ApiController]

  lazy val appController: AppController = wire[AppController]

  lazy val routes: Route =
    concat(
      apiController.routes,
      appController.routes
    )

  // Actors
  lazy val taskExecutor: ActorRef = actorSystem.actorOf(TaskExecutor.props(taskService)(defaultEc, settings), "TaskExecutor")

  // TODO from conf through a service
  actorSystem.scheduler.scheduleAtFixedRate(30 second, 60 seconds, taskExecutor, TaskExecutor.ScheduledRun)

  // Starts the akka HTTP server
  // TODO HERE + reorganize packages
}
