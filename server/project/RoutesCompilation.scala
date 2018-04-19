import play.routes.compiler.{InjectedRoutesGenerator, RoutesGenerator}
import sbt.Keys._
import sbt.{AutoPlugin, _}

object RoutesCompilation extends AutoPlugin {

  object autoImport {
    val routesAddImport      = settingKey[Seq[String]]("Routes custom imports.")
    val routesGeneratorClass = settingKey[RoutesGenerator]("RoutesGenerator used to generated all the routes.")
    val routesFile           = settingKey[String]("File containing all the routes.")

    val compileRoutes = taskKey[Seq[File]]("Compile the routes of the server.")
  }

  import autoImport._

  override def requires = plugins.JvmPlugin
  override def trigger: PluginTrigger = allRequirements

  override lazy val projectSettings = Seq(
    routesAddImport      :=  Seq.empty[String],
    routesGeneratorClass := InjectedRoutesGenerator,
    routesFile           := "routes",
    compileRoutes        := compileRoutesTask.value,

    // TODO avoid recompiling the route file if no changes have been detected
    sourceGenerators in Compile += compileRoutes
  )

  lazy val compileRoutesTask =
    Def.task {
      val log = streams.value.log

      val inputFile = (resourceDirectory in Compile).value.listFiles.find(f => f.name == routesFile.value).get
      val outputDirectory = (sourceManaged in Compile).value

      play.routes.compiler.RoutesCompiler.compile(
        play.routes.compiler.RoutesCompiler.RoutesCompilerTask(
          inputFile,
          routesAddImport.value,
          forwardsRouter = true,
          reverseRouter = true,
          namespaceReverseRouter = false
        ),
        routesGeneratorClass.value,
        outputDirectory
      ).left.map { e: Seq[play.routes.compiler.RoutesCompilationError] =>
        throw new Exception(s"Routes compilation failed: ${e.toString}")
      }.right.map { r =>
        log.success("Compiled routes files successfully!")
        r
      }.right.get
    }
}
