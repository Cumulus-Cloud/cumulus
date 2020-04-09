package io.cumulus

import java.security.Security

import akka.actor.{ActorRef, ActorSystem, Scheduler}
import akka.pattern.after
import akka.stream.Materializer
import com.softwaremill.macwire._
import com.typesafe.config.ConfigFactory
import courier.Mailer
import io.cumulus.i18n._
import io.cumulus.persistence.query.{FutureQueryRunner, QueryRunner}
import io.cumulus.persistence.storage.StorageEngines
import io.cumulus.persistence.storage.engines.LocalStorage
import io.cumulus.persistence.stores._
import io.cumulus.persistence.{Database, PooledDatabase}
import io.cumulus.services._
import io.cumulus.services.admin.UserAdminService
import io.cumulus.stages._
import io.cumulus.utils.{Configuration, Logging}
import org.bouncycastle.jce.provider.BouncyCastleProvider

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContextExecutor, Future}
import scala.io.StdIn
import scala.language.{implicitConversions, postfixOps}
import scala.util.control.NonFatal


object CumulusApplication extends App with Logging {

  // Security provider
  Security.addProvider(new BouncyCastleProvider)

  // Load the configuration
  implicit lazy val configuration: Configuration =
    Configuration(ConfigFactory.systemEnvironment().withFallback(ConfigFactory.load()))

  // Derive the settings from the loaded configuration
  implicit lazy val settings: Settings = wire[Settings]

  // List of metadata extractors available
  lazy val metadataExtractors: MetadataExtractors =
    MetadataExtractors(
      ImageMetadataExtractor,
      PDFDocumentMetadataExtractor
    )

  // List of thumbnail generator available
  lazy val thumbnailGenerators: ThumbnailGenerators =
    ThumbnailGenerators(
      ImageThumbnailGenerator,
      PDFDocumentThumbnailGenerator
    )

  // List of storage engine available
  lazy val storageEngines: StorageEngines =
    StorageEngines(
      LocalStorage
    )

  // Execution contexts
  implicit val actorSystem: ActorSystem                 = ActorSystem("cumulus-server")
  implicit lazy val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  lazy val tasksEc: ExecutionContextExecutor            = actorSystem.dispatchers.lookup("task-context")
  lazy val databaseEc: ExecutionContextExecutor         = actorSystem.dispatchers.lookup("db-context")
  lazy val scheduler: Scheduler                         = actorSystem.scheduler

  implicit lazy val materializer: Materializer = Materializer.createMaterializer(actorSystem).withNamePrefix("cumulus")

  // Database & QueryMonad to access DB
  implicit lazy val database: Database               = new PooledDatabase("default", settings.database("default"))
  implicit lazy val queryRunner: QueryRunner[Future] = new FutureQueryRunner(database, databaseEc)

  // Message providers
  lazy val messageProvider: MessagesProvider = HoconMessagesProvider.at("langs")
  implicit lazy val messages: Messages       = wire[Messages]

  // Mailer configuration
  lazy val mailer: Mailer =
    if(settings.mail.auth)
      Mailer(settings.mail.host, settings.mail.port)
        .auth(true)
        .as(settings.mail.user, settings.mail.password)
        .ssl(settings.mail.ssl)
        .startTls(settings.mail.tls)()
    else
      Mailer(settings.mail.host, settings.mail.port)
        .auth(false)()

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

  // Actors
  lazy val taskExecutor: ActorRef = actorSystem.actorOf(TaskExecutor.props(taskService)(defaultEc, settings), "TaskExecutor")

  // TODO from conf through a service
  actorSystem.scheduler.scheduleAtFixedRate(30 second, 60 seconds, taskExecutor, TaskExecutor.ScheduledRun)

  // HTTP server
  val httpServer = wire[CumulusHttpServer]

  // Starts the HTTP server
  httpServer.startServer()
    .map { bindingFuture =>

      def shutdownHttpServer(timeout: FiniteDuration): Unit = {
        Await.result(
          bindingFuture.terminate(timeout).transformWith(_ => actorSystem.terminate()),
          timeout + (2 minutes)
        )
        ()
      }

      actorSystem.registerOnTermination {
        logger.info("Application gracefully stopped")
      }

      // Waits for the end of the akka HTTP server
      if (settings.app.mode == Dev) {
        logger.info(s"Started in dev mode, press ENTER to stop...")
        StdIn.readLine() // Wait for ENTER key to be pressed
        logger.info(s"Stopping the application...")
        shutdownHttpServer(1 minute)
      } else {
        logger.info(s"Started in production mode, press CTRL-C to stop...")

        // Bind when the scala app is stopped
        scala.sys.addShutdownHook {
          logger.info(s"Stopping the application...")
          shutdownHttpServer(2 minute)
        }
      }

    }
    .recoverWith {
      case NonFatal(e) => // If we failed our initialization, terminate the actor system
        logger.error(s"Error during application initialization '${e.getMessage}', stopping the application...")
        e.printStackTrace()
        // Avoid error (noise) when killing the actor system while still creating actors
        after(2 seconds,  actorSystem.scheduler)(actorSystem.terminate())
        throw e
    }

}
