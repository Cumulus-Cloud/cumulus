import sbt._

object Dependencies {

  object postgresql {
    val version = "42.2.1"

    val core = "org.postgresql" % "postgresql" % version
  }

  object anorm {
    val version = "2.5.3"

    val core = "com.typesafe.play" %% "anorm" % version
  }

  object enumeratum {
    val version = "1.5.12"

    val core = "com.beachape"  %% "enumeratum" % version
    val play = "com.beachape"  %% "enumeratum-play" % version
  }

  object scalatest {
    val version = "3.1.2"

    val play = "org.scalatestplus.play" %% "scalatestplus-play" % version
  }

  object cats {
    val version = "1.0.1"

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
    val version = "0.14.1"

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
    val version = "2.0.8"

    val core = "org.apache.pdfbox" % "pdfbox" % version exclude("commons-logging", "commons-logging")
  }

  object macWire {
    val version = "2.3.1"

    val macros = "com.softwaremill.macwire" %% "macros" % version
  }

}
