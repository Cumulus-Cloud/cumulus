package io.cumulus

import akka.actor.{ActorSystem, Cancellable}

import scala.concurrent.ExecutionContext
import scala.concurrent.duration._
import scala.language.postfixOps

class GarbageCollector(actorSystem: ActorSystem)(implicit ec: ExecutionContext) {

  def start: Cancellable = {
    actorSystem.scheduler.schedule(0 seconds, 5 seconds) {
      println(Thread.currentThread().getName)
      println("Hey, i'm scheduled every 5 seconds")
    }
  }

}
