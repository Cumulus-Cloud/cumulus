import scala.concurrent.{ExecutionContextExecutor, Future}

import akka.actor.ActorRef
import com.marcospereira.play.i18n.{HoconI18nComponents, HoconMessagesApiProvider}
import com.typesafe.config.Config
import controllers.AssetsComponents
import io.cumulus.controllers.utils.{Assets, LoggingFilter}
import io.cumulus.controllers.{SharingManagementController, _}
import io.cumulus.core.Settings
import io.cumulus.core.controllers.utils.api.HttpErrorHandler
import io.cumulus.core.persistence.CumulusDB
import io.cumulus.core.persistence.query.QueryBuilder
import io.cumulus.persistence.services.{FsNodeService, SharingService, StorageService, UserService}
import io.cumulus.persistence.storage._
import io.cumulus.persistence.storage.engines.LocalStorage
import io.cumulus.persistence.stores.{FsNodeStore, SharingStore, UserStore}
import io.cumulus.stages._
import jsmessages.JsMessagesFactory
import play.BuiltInComponents
import play.api.{BuiltInComponentsFromContext, _}
import play.api.db.{DBComponents, Database, HikariCPComponents}
import play.api.i18n.MessagesApi
import play.api.libs.mailer.MailerComponents
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.api.routing.sird._
import play.api.mvc._
import play.api.mvc._
import play.api.routing.sird._
import play.controllers.AssetsComponents
import play.core.server.{AkkaHttpServer, AkkaHttpServerComponents}
import play.libs.ws.ahc.AhcWSComponents


class CumulusApp extends App {

  val routesURI = app.classloader.getResource("routes").toURI
  val parsedRoutes = RoutesFileParser.parse(new File(routesURI))
  println(parsedRoutes)

  val components =
    new AkkaHttpServerComponents with BuiltInComponents with HoconI18nComponents with AssetsComponents with AhcWSComponents with DBComponents with HikariCPComponents {



    }


    /*

    val server = AkkaHttpServer.fromRouterWithComponents() { components =>
    import Results._
    import components.{ defaultActionBuilder => Action }
    {
      case GET(p"/hello/$to") => Action {
        Ok(s"Hello $to")
      }
      case GET(p"/stop") => Action {
        Ok(s"OK")
      }
    }
  }*/

}

/**
  * Application compile time loader.
  */

/*
class CumulusLoader extends ApplicationLoader {

  def test = {

    val server = AkkaHttpServer.fromRouterWithComponents() { components =>
      import Results._
      import components.{ defaultActionBuilder => Action }
      {
        case GET(p"/hello/$to") => Action {
          Ok(s"Hello $to")
        }
      }
    }

  }

  def load(context: ApplicationLoader.Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    println("Starting the app")
    val app = new CumulusComponents(context).application

    import scala.concurrent.ExecutionContext.Implicits.global

    Future {
      Thread.sleep(5000)
      println("Stopping the app")

      Play.stop(app)
      app.stop().map { _ =>
        println("App stopped")

        val newApp = new CumulusComponents(context).application
        Play.start(newApp)

      }
    }

    println("App started")
    app
  }

}*/

/*
class CumulusComponents(
  context: ApplicationLoader.Context
) extends BuiltInComponentsFromContext(context)
  with HoconI18nComponents
  with AssetsComponents
  with AhcWSComponents
  with DBComponents
  with HikariCPComponents
  with MailerComponents {

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



  lazy val router: Router = new Routes(
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
  applicationEvolutions

  // Database & QueryMonad to access DB
  implicit lazy val database: Database = dbApi.database("default")
  implicit lazy val welcomeQB: QueryBuilder[CumulusDB] = QueryBuilder(CumulusDB(database), databaseEc)

  // executionContexts
  implicit val defaultEc: ExecutionContextExecutor = actorSystem.dispatcher
  val databaseEc: ExecutionContextExecutor         = actorSystem.dispatchers.lookup("db-context")
  val tasksEc: ExecutionContextExecutor            = actorSystem.dispatchers.lookup("task-context")

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
*/