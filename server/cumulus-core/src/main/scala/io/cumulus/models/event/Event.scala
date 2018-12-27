package io.cumulus.models.event

import java.time.LocalDateTime
import java.util.UUID

import enumeratum.{Enum, EnumEntry, PlayJsonEnum}
import io.cumulus.core.persistence.anorm.AnormEnum
import io.cumulus.models.fs.{FsNode, FsNodeType, Path}
import io.cumulus.models.user.User
import play.api.libs.json._
import play.api.mvc.QueryStringBindable

import scala.collection.immutable


sealed abstract class EventFamily extends EnumEntry

object EventFamily extends Enum[EventFamily] with PlayJsonEnum[EventFamily] with AnormEnum[EventFamily] {

  case object USER_EVENT extends EventFamily
  case object FS_EVENT extends EventFamily

  override val values: immutable.IndexedSeq[EventFamily] = findValues

}

/**
  * Type of all the available events.
  */
sealed abstract class EventType(val family: EventFamily) extends EnumEntry

object EventType extends Enum[EventType] with PlayJsonEnum[EventType] with AnormEnum[EventType] {

  case object USER_LOGIN extends EventType(EventFamily.USER_EVENT)
  case object USER_LOGOUT extends EventType(EventFamily.USER_EVENT)
  case object NODE_CREATE extends EventType(EventFamily.FS_EVENT)
  case object NODE_MOVE extends EventType(EventFamily.FS_EVENT)
  case object NODE_DELETE extends EventType(EventFamily.FS_EVENT)
  case object NODE_SHARE extends EventType(EventFamily.FS_EVENT)

  override val values: immutable.IndexedSeq[EventType] = findValues

  implicit def queryBinder(implicit stringBinder: QueryStringBindable[String]): QueryStringBindable[EventType] =
    new QueryStringBindable[EventType] {

      def bind(key: String, value: Map[String, Seq[String]]): Option[Either[String, EventType]] =
        stringBinder
          .bind(key, value)
          .map(_.flatMap(s => EventType.withNameInsensitiveOption(s).toRight("Invalid event type")))

      def unbind(key: String, value: EventType): String =
        value.entryName

    }

}

sealed trait Event {

  def id: UUID

  /** Type of the event **/
  def eventType: EventType

  /** Date of the event **/
  def creation: LocalDateTime

  /** UUID of the owner **/
  def owner: UUID

}

object Event {

  implicit val format: OFormat[Event] = new OFormat[Event] {
    def reads(json: JsValue): JsResult[Event] = json match {
      case jsObject: JsObject =>
        (jsObject \ "eventType").asOpt[EventType] match {
          case Some(EventType.USER_LOGIN) =>
            LoginEvent.format.reads(jsObject)
          case Some(EventType.USER_LOGOUT) =>
            LogoutEvent.format.reads(jsObject)
          case Some(EventType.NODE_CREATE) =>
            NodeCreationEvent.format.reads(jsObject)
          case Some(EventType.NODE_MOVE) =>
            NodeMoveEvent.format.reads(jsObject)
          case Some(EventType.NODE_DELETE) =>
            NodeDeletionEvent.format.reads(jsObject)
          case Some(EventType.NODE_SHARE) =>
            NodeSharingEvent.format.reads(jsObject)
          case other =>
            JsError(__ \ "eventType", JsonValidationError("validation.fs-node.unknown-type", other))
        }
      case _ =>
        JsError("validation.parsing.cannot-parse")
    }

    def writes(o: Event): JsObject = (o match {
      case event: LoginEvent =>
        LoginEvent.format.writes(event)
      case event: LogoutEvent =>
        LogoutEvent.format.writes(event)
      case event: NodeCreationEvent =>
        NodeCreationEvent.format.writes(event)
      case event: NodeMoveEvent =>
        NodeMoveEvent.format.writes(event)
      case event: NodeDeletionEvent =>
        NodeDeletionEvent.format.writes(event)
      case event: NodeSharingEvent =>
        NodeSharingEvent.format.writes(event)
    }) ++ Json.obj("eventType" -> o.eventType)
  }

}

/**
  * Event generated when a user successfully log in.
  *
  * @param creation Date of the operation.
  * @param from IP used during the log in operation.
  * @param owner User performing the operation.
  */
case class LoginEvent(
  id: UUID,
  creation: LocalDateTime,
  infinite: Boolean,
  from: String,
  owner: UUID
) extends Event {

  val eventType: EventType = EventType.USER_LOGIN

}

object LoginEvent {

  private[models] val format: OFormat[LoginEvent] =
    Json.format[LoginEvent]

  def create(from: String, infinite: Boolean, user: User): LoginEvent =
    LoginEvent(
      UUID.randomUUID(),
      LocalDateTime.now(),
      infinite,
      from,
      user.id
    )

}

/**
  * Event generated when a user log out (terminate a valid session).
  *
  * @param creation Date of the operation.
  * @param from IP used during the log out operation.
  * @param owner User performing the operation.
  */
case class LogoutEvent(
  id: UUID,
  creation: LocalDateTime,
  from: String,
  owner: UUID
) extends Event {

  val eventType: EventType = EventType.USER_LOGOUT

}

object LogoutEvent {

  private[models] val format: OFormat[LogoutEvent] =
    Json.format[LogoutEvent]

  def create(from: String, user: User): LogoutEvent =
    LogoutEvent(
      UUID.randomUUID(),
      LocalDateTime.now(),
      from,
      user.id
    )

}

/**
  * Event generated when a node is created.
  *
  * @param creation Date of the operation.
  * @param to Path of the new node.
  * @param owner User performing the operation.
  * @param node ID of the node created by the operation.
  * @param nodeType Type of the node created.
  */
case class NodeCreationEvent(
  id: UUID,
  creation: LocalDateTime,
  to: Path,
  owner: UUID,
  node: UUID,
  nodeType: FsNodeType
) extends Event {

  val eventType: EventType = EventType.NODE_CREATE

}

object NodeCreationEvent {

  private[models] val format: OFormat[NodeCreationEvent] =
    Json.format[NodeCreationEvent]

  def create(node: FsNode): NodeCreationEvent =
    NodeCreationEvent(
      UUID.randomUUID(),
      LocalDateTime.now(),
      node.path,
      node.owner,
      node.id,
      node.nodeType
    )

}

/**
  * Event generated when a node is moved (renaming are also considered as move operations).
  *
  * @param creation Date of the operation.
  * @param from Previous path of the node.
  * @param to New path of the node.
  * @param owner User performing the operation.
  * @param node ID of the node concerned by the operation.
  * @param nodeType Type of the node moved.
  */
case class NodeMoveEvent(
  id: UUID,
  creation: LocalDateTime,
  from: Path,
  to: Path,
  owner: UUID,
  node: UUID,
  nodeType: FsNodeType
) extends Event {

  val eventType: EventType = EventType.NODE_MOVE

}

object NodeMoveEvent {

  private[models] val format: OFormat[NodeMoveEvent] =
    Json.format[NodeMoveEvent]

  def create(from: Path, node: FsNode): NodeMoveEvent =
    NodeMoveEvent(
      UUID.randomUUID(),
      LocalDateTime.now(),
      from,
      node.path,
      node.owner,
      node.id,
      node.nodeType
    )

}

/**
  * Event generated when a node is deleted.
  *
  * @param creation Date of the operation.
  * @param from Path of the node deleted.
  * @param owner User performing the operation.
  * @param node ID of the node concerned by the operation.
  * @param nodeType Type of the node deleted.
  */
case class NodeDeletionEvent(
  id: UUID,
  creation: LocalDateTime,
  from: Path,
  owner: UUID,
  node: UUID,
  nodeType: FsNodeType,
withContent: Boolean
) extends Event {

  val eventType: EventType = EventType.NODE_DELETE

}

object NodeDeletionEvent {

  private[models] val format: OFormat[NodeDeletionEvent] =
    Json.format[NodeDeletionEvent]

  def create(node: FsNode, withContent: Boolean): NodeDeletionEvent =
    NodeDeletionEvent(
      UUID.randomUUID(),
      LocalDateTime.now(),
      node.path,
      node.owner,
      node.id,
      node.nodeType,
      withContent
    )
}

/**
  * Event generated when a node is shared.
  *
  * @param creation Date of the operation.
  * @param from Path of the shared node.
  * @param owner User performing the operation.
  * @param node ID of the node concerned by the operation.
  * @param nodeType Type of the node shared.
  */
case class NodeSharingEvent(
  id: UUID,
  creation: LocalDateTime,
  from: Path,
  owner: UUID,
  node: UUID,
  nodeType: FsNodeType
) extends Event {

  val eventType: EventType = EventType.NODE_SHARE

  def create(node: FsNode): NodeSharingEvent =
    NodeSharingEvent(
      UUID.randomUUID(),
      LocalDateTime.now(),
      node.path,
      node.owner,
      node.id,
      node.nodeType
    )

}

object NodeSharingEvent {

  private[models] lazy val format: OFormat[NodeSharingEvent] =
    Json.format[NodeSharingEvent]

}
