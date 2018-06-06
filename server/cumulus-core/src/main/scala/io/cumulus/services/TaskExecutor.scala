package io.cumulus.services

import java.time.LocalDateTime
import java.util.UUID

import akka.actor.{Actor, ActorLogging, Props}
import cats.data.EitherT
import cats.implicits._
import io.cumulus.core.Settings
import io.cumulus.core.validation.AppError
import io.cumulus.models.task.TaskStatus._
import io.cumulus.models.task.{OnceTask, RecurrentTask, Task}
import io.cumulus.services.TaskExecutor._

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}

/**
  * Task executor. This worker will regularly scan the database for tasks to execute. Task waiting to be executed will
  * be set in an internal map.
  */
class TaskExecutor(
  taskService: TaskService
)(implicit
  ec: ExecutionContext,
  settings: Settings
) extends Actor with ActorLogging {

  /**
    * List of tasks waiting for execution. This list may not be the same as in the database, and the worker will scan
    * regularly the database to be sure to be up to date.
    */
  private val tasks: mutable.Map[UUID, Task] = mutable.Map.empty // Be careful to only make changes from the worker thread.

  /** Number of maximum parallel tasks */
  private val maxConcurrent: Int = settings.backgroundTask.maximumParallelism

  override def preStart(): Unit =
    log.info("Starting the TaskExecutor actor..")

  override def postStop(): Unit =
    log.info("Stopping the TaskExecutor actor..")

  override def receive: Receive = {
    // Scheduled run, we need to scan the database to get tasks waiting for execution
    case ScheduledRun =>
      log.debug(s"Scheduled run of all tasks waiting for an execution")
      taskService.getTasksToExecute.map(_.map(self ! _))
      ()

    case Available =>
      executeNextTaskIfPossible()

    // The task should be executed when possible
    case task: Task if task.status == WAITING && task.scheduledExecution.forall(_.isBefore(LocalDateTime.now)) =>
      registerTask(task)
      executeNextTaskIfPossible()

    // A task has been executed, unregister it. We also should be able to start a new task
    case task: Task if task.status == DONE || task.status == FAILED =>
      unregisterTask(task)
      executeNextTaskIfPossible()

    // Ignore
    case _: Task =>
      ()

  }

  private def executeNextTaskIfPossible(): Unit = {
    if(tasks.values.count(_.status == IN_PROGRESS) < maxConcurrent) {
      tasks.headOption match {
        case Some((_, task)) =>
          log.debug(s"Starting a new task '${task.name}' (${task.id})")
          val inProgressTask = task.inProgress
          registerTask(inProgressTask) // The task is executing, we need to update it
          executeTask(inProgressTask)
        case _ =>
          log.debug("No more task to run. Waiting for new tasks...")
      }
    } else
      log.debug("Max concurrent tasks already running, waiting...")

    ()
  }

  /**
    * Execute the provided task. Once finished, the finished task will be resent to the worker.
    * @param task The task to be performed.
    */
  private def executeTask(task: Task): Future[Either[AppError, Task]] = {
    for {
      // Save the task before execution
      _ <- EitherT(taskService.upsertTask(task))

      // Run the task
      updatedTask <-EitherT.liftF(
        (task match {
          // Task that only needs to be run once
          case onceTask: OnceTask =>
            taskService.executeOnceTask(onceTask)

          // Recurrent task
          case recurrentTask: RecurrentTask =>
            taskService.executeRecurrentTask(recurrentTask)
        })
          .map {
            // The task have been successfully run. The task itself may or may not be successful.
            case Right(_) =>
              val updatedTask = task.successful
              self ! updatedTask
              updatedTask

            // The task failed to run properly.
            case Left(error) =>
              val updatedTask = task.failed(error)
              self ! updatedTask
              log.warning(s"Error occurred during the task execution of '${task.name}' (ID ''${task.id}'): $error")
              updatedTask
          }
          .recover {
            case error =>
              val updatedTask = task.failed(AppError.technical(error.getMessage)) // TODO error message
              self ! updatedTask
              log.warning(s"Unhandled error occurred during the task execution of '${task.name}' (ID ''${task.id}')", error)
              updatedTask
          }
      )

      // Save the updated task
      _ <- EitherT(taskService.upsertTask(updatedTask))

    } yield updatedTask

  }.value

  /** Register a task waiting for its execution */
  private def registerTask(task: Task): Unit =
    tasks(task.id) = task

  /** Remove an executed task from the list */
  private def unregisterTask(task: Task): Option[Task] =
    tasks.remove(task.id)

}


object TaskExecutor {

  val ScheduledRun: String = "ScheduledRun"

  val Available: String = "Available"

  def props(
    taskService: TaskService
  )(implicit
    ec: ExecutionContext,
    settings: Settings
  ): Props =
    Props(new TaskExecutor(taskService))

}
