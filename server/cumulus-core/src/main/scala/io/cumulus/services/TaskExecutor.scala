package io.cumulus.services

import java.time.LocalDateTime

import akka.actor.{Actor, ActorLogging, Props}
import io.cumulus.models.task.{OnceTask, RecurrentTask}
import io.cumulus.services.TaskExecutor._

import scala.concurrent.ExecutionContext

class TaskExecutor(
  taskService: TaskService,
  fsNodeService: FsNodeService
)(
  implicit ec: ExecutionContext
) extends Actor with ActorLogging {

  override def preStart(): Unit =
    log.info("Starting the TaskExecutor actor..")

  override def postStop(): Unit =
    log.info("Stopping the TaskExecutor actor..")

  override def receive: Receive = {
    // Scheduled run
    case ScheduledRun =>
      log.info(s"Scheduled run of all tasks waiting for an execution")
      // TODO OK to not wait and start a lot of simultaneous operations ?
      taskService.getTasksToExecute.map(_.map { tasks =>
        tasks.map {
          case task: OnceTask =>
            log.info(s"Executing the task '${task.name}' with ID '${task.id}'")
            executeOnceTask(task)
          case task: RecurrentTask =>
            log.info(s"Executing the task '${task.name}' with ID '${task.id}'")
            executeRecurrentTask(task)
        }
      })
      ()

    // Once task to execute immediately
    case task: OnceTask =>
      if(task.scheduledExecution.forall(_.isBefore(LocalDateTime.now))) {
        log.info(s"Executing the task '${task.name}' with ID '${task.id}'")
        executeOnceTask(task)
      }
      ()

    // Recurrent task to execute immediately
    case task: RecurrentTask =>
      if(task.scheduledExecution.forall(_.isBefore(LocalDateTime.now))) {
        log.info(s"Executing the task '${task.name}' with ID '${task.id}'")
        executeRecurrentTask(task)
      }
      ()

  }

  private def executeOnceTask(task: OnceTask) =
    taskService
      .executeOnceTask(task)
      .map(_.left.map { error =>
        // Log errors
        log.warning(s"Error occurred during the task execution of '${task.name}' (ID ''${task.id}'): $error")
      })

  private def executeRecurrentTask(task: RecurrentTask) =
    taskService
      .executeRecurrentTask(task)
      .map(_.left.map { error =>
        // Log errors
        log.warning(s"Error occurred during the task execution of '${task.name}' (ID ''${task.id}'): $error")
      })

}


object TaskExecutor {

  val ScheduledRun: String = "ScheduledRun"

  def props(
    taskService: TaskService,
    fsNodeService: FsNodeService
  )(implicit ec: ExecutionContext): Props =
    Props(new TaskExecutor(taskService, fsNodeService))

}
