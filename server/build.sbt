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

  // Wart warnings
  wartremoverWarnings ++= Seq(
    Wart.Null,
    Wart.ArrayEquals,
    Wart.AsInstanceOf,
    Wart.EitherProjectionPartial,
    Wart.ExplicitImplicitTypes,
    Wart.IsInstanceOf,
    Wart.OptionPartial,
    Wart.Recursion,
    Wart.Return,
    Wart.StringPlusAny,
    Wart.TraversableOps,
    Wart.TryPartial,
    Wart.While,
    Wart.Var
  ),

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

      // Twirl templates
      sourceDirectories in (Compile, TwirlKeys.compileTemplates) := (unmanagedSourceDirectories in Compile).value,
      TwirlKeys.templateImports := Seq(),

      // Route generation configuration
      routesFile := "routes",
      routesGeneratorClass := InjectedRoutesGenerator,

      // Ignore warnings from the generated files from the route
      wartremoverExcluded ++= compileRoutes.in(Compile).map(_.toSeq).value,

      // Add the generated files to the sources of the module
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
    .enablePlugins(RoutesCompilation, SbtTwirl)

// Cumulus recovery module
lazy val cumulusRecoveryModule =
  project
    .in(file("cumulus-recovery-module"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-recovery-module",

      // Twirl templates
      sourceDirectories in (Compile, TwirlKeys.compileTemplates) := (unmanagedSourceDirectories in Compile).value,
      TwirlKeys.templateImports := Seq(),

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
    .enablePlugins(SbtTwirl)

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
      cumulusCore
    )
    .dependsOn(cumulusServer)
    .enablePlugins(JavaAppPackaging)

