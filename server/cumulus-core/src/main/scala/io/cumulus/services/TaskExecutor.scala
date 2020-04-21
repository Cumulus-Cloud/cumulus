package io.cumulus.services

import java.time.LocalDateTime
import java.util.UUID

import akka.actor.{Actor, Props}
import io.cumulus.Settings
import io.cumulus.validation.AppError
import io.cumulus.task.TaskStatus._
import io.cumulus.task.{OnceTask, RecurrentTask, Task}
import io.cumulus.services.TaskExecutor._
import io.cumulus.utils.Logging

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}


/**
  * Task executor. Task waiting to be executed will be set in an internal map.
  */
class TaskExecutor(
  taskService: => TaskService
)(implicit
  ec: ExecutionContext,
  settings: Settings
) extends Actor with Logging {

  /**
    * List of tasks waiting for execution.
    */
  private val tasks: mutable.Map[UUID, Task] = mutable.Map.empty // Be careful to only make changes from the worker thread.

  /** Number of maximum parallel tasks. */
  private val maxConcurrent: Int = settings.backgroundTask.maximumParallelism

  override def preStart(): Unit =
    logger.info("Starting the TaskExecutor actor..")

  override def postStop(): Unit =
    logger.info("Stopping the TaskExecutor actor..")

  override def receive: Receive = {
    // Scheduled run, get tasks waiting for execution
    case ScheduledRun =>
      logger.debug(s"Scheduled run of all tasks waiting for an execution")
      executeNextTaskIfPossible()

    // The task should be executed when possible
    case task: Task if task.status == WAITING =>
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
      tasks.values.find(t => t.status == WAITING && t.scheduledExecution.forall(_.isBefore(LocalDateTime.now))) match {
        case Some(task) =>
          logger.debug(s"Starting a new task '${task.name}' (${task.id})")
          val inProgressTask = task.inProgress
          updateTask(inProgressTask) // The task is executing, we need to update it
          executeTask(inProgressTask)
        case _ =>
          logger.debug("No more task to run. Waiting for new tasks...")
      }
    } else
      logger.debug("Max concurrent tasks already running, waiting...")

    ()
  }

  /**
    * Execute the provided task. Once finished, the finished task will be resent to the worker.
    * @param task The task to be performed.
    */
  private def executeTask(task: Task): Future[Unit] = {

    // Run the task
    val result: Future[Either[AppError, Unit]] = task match {
      // Task that only needs to be run once
      case onceTask: OnceTask =>
        taskService.executeOnceTask(onceTask)

      // Recurrent task
      case recurrentTask: RecurrentTask =>
        taskService.executeRecurrentTask(recurrentTask)
    }

    result
      .map {
        // The task have been successfully run. The task itself may or may not be successful.
        case Right(_) =>
          self ! task.successful

        // The task failed to run properly.
        case Left(error) =>
          logger.warn(s"Error occurred during the task execution of '${task.name}' (ID ''${task.id}'): $error")
          self ! task.failed(error)
      }
      .recover {
        case error: Exception =>
          logger.warn(s"Unhandled error occurred during the task execution of '${task.name}' (ID ''${task.id}')", error)
          self ! task.failed(AppError.technical(error.getMessage)) // TODO error message
      }

  }

  /** Register a task waiting for its execution. */
  private def registerTask(task: Task): Unit =
    tasks.get(task.id) match {
      case Some(_) =>
        () // Ignore
      case None =>
        tasks(task.id) = task
    }

  /** Register a task waiting for its execution. */
  private def updateTask(task: Task): Unit =
    tasks(task.id) = task

  /** Remove an executed task from the list. */
  private def unregisterTask(task: Task): Option[Task] =
    tasks.remove(task.id)

}


object TaskExecutor {

  val ScheduledRun: String = "ScheduledRun"

  def props(
    taskService: TaskService
  )(implicit
    ec: ExecutionContext,
    settings: Settings
  ): Props =
    Props(new TaskExecutor(taskService))

}
