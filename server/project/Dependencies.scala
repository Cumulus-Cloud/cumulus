import sbt._

object Dependencies {

  object postgresql {
    val version = "42.2.6"

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

  object cats {
    val version = "1.1.0"

    val core = "org.typelevel" %% "cats-core" % version
  }

  object commonsIO {
    val version = "2.6"

    val core = "commons-io" % "commons-io" % version
  }

  object playMailer {
    val version = "6.0.1"

    val core = "com.typesafe.play" %% "play-mailer" % version
  }

  object jwtPlay {
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

}
