package io.cumulus

import java.security.Security
import java.time.Clock

import akka.actor.{ActorRef, ActorSystem, Scheduler}
import akka.stream.Materializer
import com.softwaremill.macwire._
import com.typesafe.config.ConfigFactory
import courier.Mailer
import io.cumulus.i18n._
import io.cumulus.models.user.session.AuthenticationToken
import io.cumulus.persistence.query.{FutureQueryRunner, QueryRunner}
import io.cumulus.persistence.storage.{Storage, StorageEngines}
import io.cumulus.persistence.storage.engines.LocalStorage
import io.cumulus.persistence.stores._
import io.cumulus.persistence.{Database, PooledDatabase}
import io.cumulus.services._
import io.cumulus.services.admin.UserAdminService
import io.cumulus.stages._
import io.cumulus.stream.storage.{StorageReferenceReader, StorageReferenceWriter}
import io.cumulus.utils.{Configuration, Logging}
import org.bouncycastle.jce.provider.BouncyCastleProvider

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContextExecutor, Future}
import scala.io.StdIn
import scala.language.postfixOps
import scala.util.control.NonFatal


object Main extends App with Logging {

  // Security provider for bouncy castle
  Security.addProvider(new BouncyCastleProvider)

  // The actor system running the app
  val actorSystem: ActorSystem = ActorSystem("cumulus-server")

  actorSystem.registerOnTermination {
    logger.info("Application gracefully stopped")
  }

  try {

    // Try to run the app
    CumulusApplication
      .start(actorSystem)
      .map(_ => actorSystem.terminate())(actorSystem.dispatcher)

  } catch {
    case NonFatal(e) =>
      // Log why the app couldn't start
      logger.error(s"Application startup failed: ${e.getMessage}")
      e.printStackTrace()

      // Kill the actor system, because then app wasn't able to start
      actorSystem.terminate()
  }

}

/**
 * Cumulus application running on the provided actor system. The lifecycle of the provided actor system should be
 * handled and stopped if the initialisation failed or when the server is stopped. Use the provided run value
 * to bind it to the app's lifecycle.
 */
class CumulusApplication(actorSystem: ActorSystem) extends Logging {

  // System clock (used for JWT)
  implicit val clock: Clock = Clock.systemUTC

  // Load the configuration
  implicit lazy val configuration: Configuration =
    Configuration(ConfigFactory.systemEnvironment().withFallback(ConfigFactory.load()))

  // Derive the settings from the loaded configuration
  implicit lazy val settings: Settings = wire[Settings]

  // List of metadata extractors available
  lazy val metadataExtractors: MetadataExtractors =
    MetadataExtractors(
      wire[ImageMetadataExtractor],
      wire[PDFDocumentMetadataExtractor]
    )

  // List of thumbnail generator available
  lazy val thumbnailGenerators: ThumbnailGenerators =
    ThumbnailGenerators(
      wire[ImageThumbnailGenerator],
      wire[PDFDocumentThumbnailGenerator]
    )

  // List of storage engine available
  lazy val storageEngines: StorageEngines =
    StorageEngines(
      LocalStorage,
      // TODO more storage engines
    )

  lazy val storageReferenceReader: StorageReferenceReader = wire[StorageReferenceReader]
  lazy val storageReferenceWrite: StorageReferenceWriter = wire[StorageReferenceWriter]
  lazy val storage: Storage = wire[Storage]

  // Execution contexts
  implicit val implicitActorSystem: ActorSystem         = actorSystem
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
  implicit lazy val messages: Messages       = new Messages(settings.app.defaultLang, settings.app.langs, messageProvider)

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
  lazy val userService: UserService                        = wire[UserService]
  lazy val fsNodeService: FsNodeService                    = wire[FsNodeService]
  lazy val storageService: StorageService                  = wire[StorageService]
  lazy val sharingService: SharingService                  = wire[SharingService]
  lazy val sessionService: SessionService                  = wire[SessionService]
  lazy val eventService: EventService                      = wire[EventService]
  lazy val taskService: TaskService                        = wire[TaskService]
  lazy val tokenService: TokenService[AuthenticationToken] = wire[JwtTokenService[AuthenticationToken]]
  lazy val mailService: MailService                        = wire[MailService]

  // Admin services
  lazy val userServiceAdmin: UserAdminService = wire[UserAdminService]

  // Actors
  lazy val taskExecutor: ActorRef = actorSystem.actorOf(TaskExecutor.props(taskService)(defaultEc, settings), "TaskExecutor")

  // TODO from conf through a service
  // actorSystem.scheduler.scheduleAtFixedRate(30 second, 60 seconds, taskExecutor, TaskExecutor.ScheduledRun)

  // HTTP server
  val httpServer: CumulusHttpServer = wire[CumulusHttpServer]

  // Starts the HTTP server
  val run: Future[Unit] =
    httpServer.startServer()
      .map { bindingFuture =>

        def shutdownHttpServer(timeout: FiniteDuration): Unit = {
          Await.result(
            bindingFuture.terminate(timeout).map(_ => ()),
            timeout + (2 minutes)
          )
        }

        // Waits for the end of the akka HTTP server
        if (settings.app.mode == Dev) {
          logger.info(s"Application started in dev mode, press ENTER to stop...")
          StdIn.readLine() // Wait for ENTER key to be pressed
          logger.info(s"Stopping the application...")
          shutdownHttpServer(1 minute)
        } else {
          logger.info(s"Application started in production mode, press CTRL-C to stop...")

          // Bind when the scala app is stopped
          scala.sys.addShutdownHook {
            logger.info(s"Stopping the application...")
            shutdownHttpServer(2 minute)
          }
        }

        ()
      }
      .recoverWith {
        case NonFatal(e) => // If we failed our initialization, terminate the actor system
          logger.error(s"Error during server initialization '${e.getMessage}'")
          e.printStackTrace()
          Future.successful(())
      }

}

object CumulusApplication {

  def start(actorSystem: ActorSystem): Future[Unit] =
    new CumulusApplication(actorSystem).run

}