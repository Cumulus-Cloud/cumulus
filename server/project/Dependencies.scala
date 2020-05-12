import sbt._

object Dependencies {

  object akka {
    val version = "2.6.4"

    val actor = "com.typesafe.akka" %% "akka-actor" % version
    val stream = "com.typesafe.akka" %% "akka-stream" % version
    val sl4j = "com.typesafe.akka" %% "akka-slf4j" % version
    val http = "com.typesafe.akka" %% "akka-http" % "10.1.11"
    val httpPlayJson = "de.heikoseeberger" %% "akka-http-play-json" % "1.31.0"
  }

  object scalaLogging {
    val logBack = "ch.qos.logback" % "logback-classic" % "1.2.3"
    val core = "com.typesafe.scala-logging" %% "scala-logging" % "3.9.2"
  }

  object postgresql {
    val version = "42.2.6"

    val core = "org.postgresql" % "postgresql" % version
  }

  object anorm {
    val version = "2.5.3"

    val core = "com.typesafe.play" %% "anorm" % version
  }

  object flyway {
    val version = "6.2.4"

    val core = "org.flywaydb" % "flyway-core" % version
  }

  object scalikejdbc {
    val version = "3.4.+"

    val core = "org.scalikejdbc" %% "scalikejdbc" % version
  }

  object enumeratum {
    val version = "1.5.13"

    val core = "com.beachape"  %% "enumeratum" % version
    val playJson = "com.beachape"  %% "enumeratum-play-json" % version
  }

  object cats {
    val version = "1.1.0"

    val core = "org.typelevel" %% "cats-core" % version
  }

  object commonsIO {
    val version = "2.6"

    val core = "commons-io" % "commons-io" % version
  }

  object courier {
    val version = "2.0.0"

    val core = "com.github.daddykotex" %% "courier" % version
  }

  object jwt {
    val version = "3.0.1"

    val core = "com.pauldijou" %% "jwt-core" % version
    val playJson = "com.pauldijou" %% "jwt-play-json" % version
  }

  object bouncyCastle {
    val version = "1.62"

    val core = "org.bouncycastle" % "bcprov-jdk15on" % version
  }

  object scrimage {
    val version = "2.1.8"

    val core = "com.sksamuel.scrimage" % "scrimage-core_2.12" % version
    val ioExtra = "com.sksamuel.scrimage" % "scrimage-io-extra_2.12" % version
  }

  object pdfbox {
    val version = "2.0.16"

    val core = "org.apache.pdfbox" % "pdfbox" % version exclude("commons-logging", "commons-logging")
  }

  object scalatags {
    val version = "0.7.0"

    val core = "com.lihaoyi" %% "scalatags" % version
  }

  object scalacss {
    val version = "0.5.6"

    val core = "com.github.japgolly.scalacss" %% "core" % version
    val scalatagsExt = "com.github.japgolly.scalacss" %% "ext-scalatags" % version
  }

  object macWire {
    val version = "2.3.3"

    val macros = "com.softwaremill.macwire" %% "macros" % version
  }

  object silencer {
    val version = "1.4.1"

    val plugin = compilerPlugin("com.github.ghik" %% "silencer-plugin" % version)
    val lib    = "com.github.ghik" %% "silencer-lib" % version
  }

  object elastic {
    val version = "7.6.1"

    val client = "com.sksamuel.elastic4s" %% "elastic4s-client-esjava" % version
  }

}
