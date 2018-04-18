package io.cumulus.stages

import play.api.mvc.{Action, Results}
import play.api.mvc.Results.Ok
import play.core.server.AkkaHttpServer

object CumulusApp extends App {

  val components = new AkkaHttpServerComponents with BuiltInComponents with NoHttpFiltersComponents {

    override lazy val router: Router = Router.from {
      case GET(p"/hello/$to") => Action {
        Results.Ok(s"Hello $to")
      }
    }

    override lazy val httpErrorHandler = new DefaultHttpErrorHandler(
      environment,
      configuration,
      sourceMapper,
      Some(router)
    ) {

      override protected def onNotFound(request: RequestHeader, message: String): Future[Result] = {
        Future.successful(Results.NotFound("Nothing was found!"))
      }
    }
  }
  val server = components.server

  val server = AkkaHttpServer.fromRouterWithComponents() { components =>
    import Results._
    import components.{defaultActionBuilder => Action}
    {
      case GET(p"/hello/$to") => Action {
        Ok(s"Hello $to")
      }
      case GET(p"/ok") => Action {
        Ok(s"OK")
      }
    }
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

