import sbt._

object Dependencies {

  object akka {
    val version = "2.5.6"

    val actor = "com.typesafe.akka" %% "akka-actor" % version
    val stream = "com.typesafe.akka" %% "akka-stream" % version
  }

  object sl4j {
    val version = "1.7.25"

    val core = "org.slf4j" % "slf4j-api" % version
  }

  object guava {
    val version = "22.0"

    val core = "com.google.guava" % "guava" % "22.0"
  }

  object postgresql {
    val version = "42.2.2"

    val core = "org.postgresql" % "postgresql" % version
  }

  object anorm {
    val version = "2.5.3"

    val core = "com.typesafe.play" %% "anorm" % version
  }

  object enumeratum {
    val version = "1.5.13"

    val core = "com.beachape"  %% "enumeratum" % version
    val play = "com.beachape"  %% "enumeratum-play" % version
  }

  object scalatest {
    val version = "3.1.2"

    val play = "org.scalatestplus.play" %% "scalatestplus-play" % version
  }

  object cats {
    val version = "1.1.0"

    val core = "org.typelevel" %% "cats-core" % version
  }

  object i18nHocon {
    val version = "1.0.1"

    val core = "com.github.marcospereira" %% "play-hocon-i18n" % version
  }

  object commonsIO {
    val version = "2.6"

    val core = "commons-io" % "commons-io" % version
  }

  object playMailer {
    val version = "6.0.1"

    val core = "com.typesafe.play" %% "play-mailer" % version
  }

  object jsMessages {
    val version = "3.0.0"

    val core = "org.julienrf" %% "play-jsmessages" % version
  }

  object jwtPlay {
    val version = "0.16.0"

    val core = "com.pauldijou" %% "jwt-play" % version
  }

  object bouncyCastle {
    val version = "1.59"

    val core = "org.bouncycastle" % "bcprov-jdk15on" % version
  }

  object scrimage {
    val version = "2.1.8"

    val core = "com.sksamuel.scrimage" % "scrimage-core_2.12" % version
    val ioExtra = "com.sksamuel.scrimage" % "scrimage-io-extra_2.12" % version
  }

  object pdfbox {
    val version = "2.0.9"

    val core = "org.apache.pdfbox" % "pdfbox" % version exclude("commons-logging", "commons-logging")
  }

  object macWire {
    val version = "2.3.1"

    val macros = "com.softwaremill.macwire" %% "macros" % version
  }

  object silencer {
    val version = "0.6"

    val plugin = compilerPlugin("com.github.ghik" %% "silencer-plugin" % version)
    val lib    = "com.github.ghik" %% "silencer-lib" % version
  }

}
