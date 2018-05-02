package io.cumulus.models.configuration.utils

import play.api.libs.json.{Json, Writes}

trait TestResult {
  def success: Boolean
}

object TestResult {

  implicit val writer: Writes[TestResult] = {
    case TestSuccessful =>
      Json.obj("success" -> true)
    case TestFailed(error) =>
      Json.obj("success" -> false, "error" -> error)
  }

}

case object TestSuccessful extends TestResult {
  val success = true
}

case class TestFailed(error: String) extends TestResult {
  val success = false
}
