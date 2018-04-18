organization in ThisBuild := "io.cumulus"

scalaVersion in ThisBuild := "2.12.4"

scalacOptions in ThisBuild := Seq(
  "-encoding",
  "UTF-8",
  "-target:jvm-1.8",
  "-Ywarn-adapted-args",
  "-Ywarn-inaccessible",
  "-Ywarn-nullary-override",
  "-Ywarn-infer-any",
  "-Ywarn-dead-code",
  "-Ywarn-unused",
  "-Ywarn-unused-import",
  "-Ywarn-value-discard",
  "-Ypartial-unification",
  "-unchecked",
  "-deprecation",
  "-feature",
  "-g:vars",
  "-Xlint:_",
  "-Ywarn-macros:after",
  "-opt:l:inline",
  "-opt-inline-from"
)

lazy val commonSettings = Seq(
  version := "0.1-SNAPSHOT",
  organization := "io.cumulus",
  scalaVersion := "2.12.4",
  test in assembly := {}
)

assemblyMergeStrategy in assembly := {
  case manifest if manifest.contains("MANIFEST.MF") =>
    // We don't need manifest files since sbt-assembly will create
    // one with the given settings
    MergeStrategy.discard
  case referenceOverrides if referenceOverrides.contains("reference-overrides.conf") =>
    // Keep the content for all reference-overrides.conf files
    MergeStrategy.concat
  case x =>
    // For all the other files, use the default sbt-assembly merge strategy
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(x)
}

lazy val cumulusServer = project
  .in(file("."))
  .settings(commonSettings: _*)
  .settings(
    name := "cumulus-server",
    mainClass in assembly := Some("io.cumulus.CumulusApp"),

    // Allow to use `Path` and `FsNodeType` in route
    routesAddImport += "io.cumulus.models.Path",
    routesAddImport += "io.cumulus.models.fs.FsNodeType",
    routesFile := "routes",
    routesGeneratorClass := InjectedRoutesGenerator,

    libraryDependencies ++= Seq(
      // Play server
      akkaHttpServer,
      javaCore,
      ws,
      // Logging
      //logback,
      // i18n
      Dependencies.jsMessages.core,
      Dependencies.i18nHocon.core,
      // Persistence
      jdbc,
      evolutions,
      //evolutions,
      Dependencies.postgresql.core,
      Dependencies.anorm.core,
      Dependencies.commonsIO.core,
      // enums utils
      Dependencies.enumeratum.core,
      Dependencies.enumeratum.play,
      // cats
      Dependencies.cats.core,
      // JWT
      Dependencies.jwtPlay.core,
      // Emails
      Dependencies.playMailer.core,
      // Thumbnails generation
      Dependencies.scrimage.core,
      Dependencies.scrimage.ioExtra,
      // PDF handling
      Dependencies.pdfbox.core,
      // Crypto
      Dependencies.bouncyCastle.core,
      // Test dependencies
      Dependencies.scalatest.play % Test
    )
  )
  .enablePlugins(RoutesCompilation, SbtTwirl)

