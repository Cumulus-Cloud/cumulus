import play.routes.compiler.{InjectedRoutesGenerator, RoutesGenerator}
import sbt.Keys._
import sbt.{AutoPlugin, _}

object RoutesCompilation extends AutoPlugin {

  object autoImport {
    val routesAddImport      = settingKey[Seq[String]]("Routes custom imports.")
    val routesGeneratorClass = settingKey[RoutesGenerator]("RoutesGenerator used to generated all the routes.")
    val routesFile           = settingKey[String]("File containing all the routes.")

    val compileRoutes = taskKey[Set[File]]("Compile the routes of the server.")
  }

  import autoImport._

  override def requires = plugins.JvmPlugin
  override def trigger: PluginTrigger = allRequirements

  override lazy val projectSettings = Seq(
    routesAddImport      :=  Seq.empty[String],
    routesGeneratorClass := InjectedRoutesGenerator,
    routesFile           := "routes",
    compileRoutes        := compileRoutesTask.value,

    sourceGenerators in Compile += compileRoutes.map(_.toSeq)
  )

  lazy val compileRoutesTask =
    Def.task {
      val log = streams.value.log

      val inputFile = (resourceDirectory in Compile).value.listFiles.find(f => f.name == routesFile.value).get
      val outputDirectory = (sourceManaged in Compile).value
      val cacheDir = (target in Compile).value / "generated-routes-cache"

      val cached =
        FileFunction.cached(cacheDir, FilesInfo.lastModified, FilesInfo.exists) {(inputFiles: Set[File]) =>
          compileRoutesImpl(inputFiles, outputDirectory, routesAddImport.value, routesGeneratorClass.value, log)
        }

      cached(Set(inputFile))
    }

  def compileRoutesImpl(
    inputFiles: Set[File],
    outputDirectory: File,
    imports: Seq[String],
    routesGenerator: RoutesGenerator,
    log: Logger
  ): Set[File] = {
    inputFiles.flatMap { inputFile =>
      play.routes.compiler.RoutesCompiler.compile(
        play.routes.compiler.RoutesCompiler.RoutesCompilerTask(
          inputFile,
          imports,
          forwardsRouter = true,
          reverseRouter = true,
          namespaceReverseRouter = false
        ),
        routesGenerator,
        outputDirectory
      ).left.map { e: Seq[play.routes.compiler.RoutesCompilationError] =>
        throw new Exception(s"Routes compilation failed: ${e.toString}")
      }.right.map { r =>
        log.success("Compiled routes files successfully!")
        r
      }.right.get.toSet
    }
  }

}
