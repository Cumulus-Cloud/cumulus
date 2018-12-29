import { FsNodeType } from './FsNode'

export type EventType =
  'USER_LOGIN' |
  'USER_LOGOUT' |
  'NODE_CREATE' |
  'NODE_MOVE' |
  'NODE_DELETE' |
  'NODE_SHARE'

  
export type Event =
  LoginEvent |
  LogoutEvent |
  NodeCreationEvent |
  NodeMoveEvent |
  NodeDeletionEvent |
  NodeSharingEvent

export interface LoginEvent {
  id: string,
  eventType: 'USER_LOGIN'
  creation: Date,
  infinite: boolean,
  from: string,
  owner: string
}

export interface LogoutEvent {
  id: string,
  eventType: 'USER_LOGOUT'
  creation: Date,
  from: string,
  owner: string
}

export interface NodeCreationEvent {
  id: string,
  eventType: 'NODE_CREATE'
  creation: Date,
  to: string,
  owner: string,
  node: string,
  nodeType: FsNodeType
}

export interface NodeMoveEvent {
  id: string,
  eventType: 'NODE_MOVE'
  creation: Date,
  from: string,
  to: string,
  owner: string,
  node: string,
  nodeType: FsNodeType
}

export interface NodeDeletionEvent {
  id: string,
  eventType: 'NODE_DELETE'
  creation: Date,
  from: string,
  owner: string,
  node: string,
  nodeType: FsNodeType
}

export interface NodeSharingEvent {
  id: string,
  eventType: 'NODE_SHARE'
  creation: Date,
  from: string,
  owner: string,
  node: string,
  nodeType: FsNodeType
}

