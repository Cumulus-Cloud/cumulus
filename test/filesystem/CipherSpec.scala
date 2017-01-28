package filesystem

import akka.util.ByteString
import org.scalatestplus.play.{OneAppPerSuite, PlaySpec}
import play.api.inject.guice.GuiceApplicationBuilder
import utils.{Conf, Utils}

class CipherSpec extends PlaySpec with OneAppPerSuite {
  implicit override lazy val app = new GuiceApplicationBuilder()
    .configure(Map(
      "play.crypto.secret" -> "super secret passphrase"
    ))
    .build()

  val toEncode = ByteString("The bytes of this string will be used as a test".getBytes)
  val toEncodeExpected = "VGhlIGJ5dGVzIG9mIHRoaXMgc3RyaW5nIHdpbGwgYmUgdXNlZCBhcyBhIHRlc3Q="

  val toEncrypt = ByteString("Really secret message to encrypt".getBytes)
  val toDecrypt = "L+0TR3oR2UX6HbbGhM3cWg==$a5MfMOUd1zchlJOeKs43+UDW+6WalRbx8AhUTCZ/pvY92BI5e3LfwyNAWDuwGiXZ"

  "Base 64 encoding" should {

    "encode a byte array to the expected value" in {
      assert(Utils.encodeBase64(toEncode) == toEncodeExpected)
    }

    "decode a base 64 string UTF8 string to the expected value" in {
      Utils.decodeBase64(toEncodeExpected).contains(toEncode)
    }

    "encode and decode without modifications" in {
      assert(Utils.decodeBase64(Utils.encodeBase64(toEncode)).contains(toEncode))
    }

    "fail to decode an incorrect base 64 string" in {
      assert(Utils.decodeBase64("hello" + toEncodeExpected).isEmpty)
    }

  }

  "AES Cipher using conf key" should {

    "crypt to the expected value" in {
      implicit val conf = app.injector.instanceOf[Conf]

      assert(Utils.Crypto.encrypt(toEncrypt).contains("$"))
    }

    "decrypt to the expected value" in {
      implicit val conf = app.injector.instanceOf[Conf]

      assert(Utils.Crypto.decrypt(toDecrypt).contains(toEncrypt))
    }

    "encrypt and decrypt without modifications" in {
      implicit val conf = app.injector.instanceOf[Conf]

      assert(Utils.Crypto.decrypt(Utils.Crypto.encrypt(toEncrypt)).contains(toEncrypt))
    }

  }

}
