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

lazy val cumulusServer = project
  .in(file("."))
  .settings(
    name := "cumulus-server",
    routesImport += "io.cumulus.models.Path",
    libraryDependencies ++= Seq(
      ws,
      // i18n
      Dependencies.jsMessages.core,
      Dependencies.i18nHocon.core,
      // Persistence
      jdbc,
      evolutions,
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
      // json derived format
      Dependencies.jsonDerivedCodecs.core,
      // Emails
      Dependencies.playMailer.core,
      // Thumbnails generation
      Dependencies.scrimage.core,
      Dependencies.scrimage.ioExtra,
      // Crypto
      Dependencies.bouncyCastle.core,
      // Test dependencies
      Dependencies.scalatest.play % Test
    )
  )
  .enablePlugins(PlayScala)
