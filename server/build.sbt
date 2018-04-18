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

    // Allow to use `Path` and `FsNodeType` in route
    routesAddImport += "io.cumulus.models.Path",
    routesAddImport += "io.cumulus.models.fs.FsNodeType",
    routesFile := "routes",
    routesGeneratorClass := InjectedRoutesGenerator,

    libraryDependencies ++= Seq(
      "com.typesafe.play" %% "play-akka-http-server" % "2.6.13",
      "com.typesafe.play" %% "twirl-api" % "1.3.15",
      "com.typesafe.play" %% "play-ws" % "2.6.13",
      "com.typesafe.play" %% "play-json" % "2.6.9",
      "com.typesafe.play" %% "play-logback" % "2.6.13",
      "com.typesafe.play" %% "play-jdbc" % "2.6.13",
      //"com.typesafe.play" %% "routes-compiler" % "2.6.13",
      "com.typesafe.play" %% "sbt-routes-compiler" % "2.6.13",


        //ws,
      // i18n
      Dependencies.jsMessages.core,
      Dependencies.i18nHocon.core,
      // Persistence
      //jdbc,
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
  .enablePlugins(RoutesCompilation)

