organization in ThisBuild := "io.cumulus"

scalaVersion in ThisBuild := "2.12.5"

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
  // Application common info
  version := "0.1-SNAPSHOT",
  organization := "io.cumulus",
  scalaVersion := "2.12.5",

  // Do not show eviction warnings, because we can't really do anything
  // to suppress them...
  evictionWarningOptions in update := EvictionWarningOptions.default
    .withWarnTransitiveEvictions(false)
    .withWarnDirectEvictions(false)
)

lazy val serverMainClass = Some("io.cumulus.CumulusApp")

// Cumulus core project
lazy val cumulusCore =
  project
    .in(file("cumulus-core"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-core",
      libraryDependencies ++= Seq(
        // i18n
        Dependencies.jsMessages.core,
        Dependencies.i18nHocon.core,
        // Persistence
        jdbc,
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
        // Templating
        Dependencies.scalatags.core,
        Dependencies.scalacss.core,
        Dependencies.scalacss.scalatagsExt,
        // Thumbnails generation
        Dependencies.scrimage.core,
        Dependencies.scrimage.ioExtra,
        // PDF handling
        Dependencies.pdfbox.core,
        // Crypto
        Dependencies.bouncyCastle.core,
        // Silencer plugin
        Dependencies.silencer.plugin,
        Dependencies.silencer.lib
      )
    )

// Cumulus module
lazy val cumulusMainModule =
  project
    .in(file("cumulus-main-module"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-main-module",

      // Allow to use `Path` and `FsNodeType` in route
      routesAddImport += "io.cumulus.models.Path",
      routesAddImport += "io.cumulus.models.fs.FsNodeType",
      routesFile := "routes",
      routesGeneratorClass := InjectedRoutesGenerator,

      sourceGenerators in Compile += compileRoutes.map(_.toSeq),

      libraryDependencies ++= Seq(
        // Persistence
        jdbc,
        evolutions,
        Dependencies.postgresql.core,
        Dependencies.anorm.core,
        // cats
        Dependencies.cats.core,
        // Emails
        Dependencies.playMailer.core,
        // MacWire
        Dependencies.macWire.macros,
        // Silencer plugin
        Dependencies.silencer.plugin,
        Dependencies.silencer.lib
      )
    )
    .dependsOn(cumulusCore)
    .enablePlugins(RoutesCompilation)

// Cumulus recovery module
lazy val cumulusRecoveryModule =
  project
    .in(file("cumulus-recovery-module"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-recovery-module",

      libraryDependencies ++= Seq(
        // Persistence
        jdbc,
        evolutions,
        // enums utils
        Dependencies.enumeratum.core,
        Dependencies.enumeratum.play,
        // cats
        Dependencies.cats.core,
        // Emails
        Dependencies.playMailer.core,
        // MacWire
        Dependencies.macWire.macros,
        // Silencer plugin
        Dependencies.silencer.plugin,
        Dependencies.silencer.lib
      )
    )
    .dependsOn(cumulusCore)

// Cumulus installation module
lazy val cumulusInstallationModule =
  project
    .in(file("cumulus-installation-module"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-installation-module",

      libraryDependencies ++= Seq(
        // Persistence
        jdbc,
        evolutions,
        // enums utils
        Dependencies.enumeratum.core,
        Dependencies.enumeratum.play,
        // cats
        Dependencies.cats.core,
        // Emails
        Dependencies.playMailer.core,
        // MacWire
        Dependencies.macWire.macros,
        // Silencer plugin
        Dependencies.silencer.plugin,
        Dependencies.silencer.lib
      )
    )
    .dependsOn(cumulusCore)

// Cumulus server resources
lazy val cumulusServerResources =
  project
    .in(file("cumulus-server-resources"))
    .settings(commonSettings: _*)

// Cumulus server
lazy val cumulusServer =
  project
    .in(file("cumulus-server"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-server",
      mainClass in Compile := serverMainClass,
      libraryDependencies ++= Seq(
        // Play server
        akkaHttpServer,
        nettyServer,
        playCore,
        ws,
        // Test dependencies
        Dependencies.scalatest.play % Test,
        // Silencer plugin
        Dependencies.silencer.plugin,
        Dependencies.silencer.lib
      )
    )
    .dependsOn(cumulusMainModule, cumulusRecoveryModule, cumulusServerResources)
    .enablePlugins(JavaAppPackaging)

// Cumulus dev server
lazy val cumulusServerDev =
  project
    .in(file("cumulus-server-dev"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-server-dev",
      libraryDependencies ++= Seq(
        // Test dependencies
        Dependencies.scalatest.play % Test
      )
    )
    .dependsOn(cumulusMainModule, cumulusServerResources)
    .enablePlugins(PlayScala)
    .disablePlugins(PlayLayoutPlugin)

lazy val runDev = taskKey[Unit]("Executes `cumulusServerDev/run`")

// Main project
lazy val cumulusRoot =
  project
    .in(file("."))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus",
      mainClass in Compile := serverMainClass,
      runDev := {
        (run in Compile in cumulusServerDev).toTask("").value
      }
    )
    .aggregate(
      cumulusServer,
      cumulusServerDev,
      cumulusServerResources,
      cumulusMainModule,
      cumulusRecoveryModule,
      cumulusInstallationModule,
      cumulusCore
    )
    .dependsOn(cumulusServer)
    .enablePlugins(JavaAppPackaging)

