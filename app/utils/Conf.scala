package utils

import javax.inject.Inject

import play.api.Configuration

class Conf @Inject() (conf: Configuration) {
  val cryptoKey = conf.getString("play.crypto.secret")
                      .getOrElse(throw new RuntimeException("play.crypto.secret config required"))
  val all = conf
}
