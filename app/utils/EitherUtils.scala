package utils

object EitherUtils {

  // Allow to use either as a monad
  implicit class EitherT[A, B](e: Either[A, B]) {
    def map[B1](f: B => B1) = e.right map f
    def flatMap[B1](f: B => Either[A, B1]) = e.right flatMap f
  }

}
