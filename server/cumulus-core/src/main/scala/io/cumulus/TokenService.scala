package io.cumulus

import java.time.Clock

import io.cumulus.validation.AppError
import pdi.jwt.{Jwt, JwtAlgorithm, JwtClaim}
import pdi.jwt.algorithms.JwtHmacAlgorithm
import play.api.libs.json.{Format, Json, Reads}

import scala.util.Try
import scala.util.control.NonFatal

/**
 * Base trait defining a token parser.
 * @tparam T The token's claim type.
 */
trait TokenService[T] {

  def decode(token: String): Either[AppError, T]

  def encode(claim: T): String

}

class JwtTokenService[T](implicit
  clock: Clock,
  settings: Settings,
  format: Format[T]
) extends TokenService[T] {

  import pdi.jwt.exceptions._

  private val secret = settings.security.secret
  private val algorithm =settings.security.algorithm

  def decode(token: String): Either[AppError, T] =
    for {
      jwt     <- validatedAndExtractClaim(token)
      content <- parseClaim(jwt)
    } yield content

  def encode(claim: T): String = {
    val token =
      JwtClaim()
        .issuedNow
        .expiresIn(settings.security.sessionDuration)
        .withContent(Json.toJson(claim).toString)

    Jwt.encode(token, secret, algorithm)
  }

  private def parseClaim(claim: JwtClaim): Either[AppError, T] =
    Try(Json.parse(claim.content).as[T]).toEither.left.map(_ => AppError.unauthorized("auth.error.invalid-claim"))

  private def validatedAndExtractClaim(token: String): Either[AppError, JwtClaim] =
    Jwt.decode(token, secret, Seq(algorithm)).toEither.left.map(exceptionToAppError(_))

  private def exceptionToAppError(throwable: Throwable): AppError = {
    case e: JwtException =>
      jwtExceptionToAppError(e)
    case NonFatal(e) =>
      AppError.technical(e)
  }

  private def jwtExceptionToAppError(exception: JwtException): AppError = {
    case _: JwtEmptySignatureException =>
      AppError.unauthorized("auth.error.invalid-signature")
    case _: JwtExpirationException =>
      AppError.unauthorized("auth.error.expired")
    case _: JwtValidationException =>
      AppError.unauthorized("auth.error.invalid-signature")
    case _ =>
      AppError.unauthorized("auth.error.invalid")
  }

}
