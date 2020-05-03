organization in ThisBuild := "io.cumulus"

scalaVersion in ThisBuild := "2.12.8"

scalacOptions in ThisBuild := Seq(
  "-encoding",
  "UTF-8",
  "-target:jvm-1.8",
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
  "-Xlint:-adapted-args,_",
  "-Ywarn-macros:after",
  "-opt:l:inline",
  "-opt-inline-from"
)

lazy val commonSettings = Seq(
  // Application common info
  version := "0.1-SNAPSHOT",
  organization := "io.cumulus",
  scalaVersion := "2.12.8",

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

  libraryDependencies ++= Seq(
    // Silencer plugin
    Dependencies.silencer.plugin,
    Dependencies.silencer.lib
  ),

  // Do not show eviction warnings, because we can't really do anything
  // to suppress them...
  evictionWarningOptions in update := EvictionWarningOptions.default
    .withWarnTransitiveEvictions(false)
    .withWarnDirectEvictions(false)
)

lazy val cumulusCommon =
  project
    .in(file("cumulus-common"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-common",
      libraryDependencies ++= Seq(
        // Akka
        Dependencies.akka.actor,
        Dependencies.akka.stream,
        Dependencies.akka.sl4j,
        // Logging
        Dependencies.scalaLogging.logBack,
        Dependencies.scalaLogging.core,
        // Persistence
        Dependencies.flyway.core,
        Dependencies.scalikejdbc.core,
        Dependencies.postgresql.core,
        Dependencies.anorm.core,
        Dependencies.commonsIO.core,
        // Enums utils
        Dependencies.enumeratum.core,
        Dependencies.enumeratum.playJson,
        // Cats
        Dependencies.cats.core,
        // Crypto
        Dependencies.bouncyCastle.core
      )
    )

// Cumulus core project
lazy val cumulusCore =
  project
    .in(file("cumulus-core"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-core",
      libraryDependencies ++= Seq(
        // JWT
        Dependencies.jwt.core,
        Dependencies.jwt.playJson,
        // Emails
        Dependencies.courier.core,
        // Templating
        Dependencies.scalatags.core,
        Dependencies.scalacss.core,
        Dependencies.scalacss.scalatagsExt,
        // Thumbnails generation
        Dependencies.scrimage.core,
        Dependencies.scrimage.ioExtra,
        // PDF handling
        Dependencies.pdfbox.core
      )
    )
    .dependsOn(cumulusCommon)

// Cumulus akka server
lazy val cumulusServer =
  project
    .in(file("cumulus-server"))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus-server",
      // Dependencies
      libraryDependencies ++= Seq(
        // Akka HTTP
        Dependencies.akka.http,
        Dependencies.akka.httpPlayJson,
        // MacWire
        Dependencies.macWire.macros,
        // Silencer plugin
        Dependencies.silencer.plugin,
        Dependencies.silencer.lib
      )
    )
    .dependsOn(cumulusCore)
    .enablePlugins(JavaAppPackaging)

// Main project
lazy val cumulusRoot =
  project
    .in(file("."))
    .settings(commonSettings: _*)
    .settings(
      name := "cumulus"
    )
    .aggregate(
      cumulusServer,
      cumulusCore
    )
    .dependsOn(cumulusServer)
