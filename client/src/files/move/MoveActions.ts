import { Action } from "redux"
import { ApiError } from "services/Api"
import { FsNode, FsDirectory } from "models/FsNode"

export type MoveAction =
  WantMove |
  CancelMove |
  ChangeMoveTarget |
  ChangeMoveTargetSuccess |
  ChangeMoveTargetError |
  Move |
  MoveSuccess |
  MoveError

export interface WantMove extends Action {
  type: "WantMove"
  fsNodes: FsNode[]
  target: FsDirectory
}
export function wantMove(fsNodes: FsNode[], target: FsDirectory): WantMove {
  return { type: "WantMove", fsNodes, target }
}

export interface CancelMove extends Action {
  type: "CancelMove"
}
export function cancelMove(): CancelMove {
  return { type: "CancelMove" }
}

export interface Move extends Action {
  type: "Move"
  fsNodeToMove: FsNode
  target: FsDirectory
}
export function move(fsNodeToMove: FsNode, target: FsDirectory): Move {
  return { type: "Move", fsNodeToMove, target }
}

export interface MoveSuccess extends Action {
  type: "MoveSuccess"
  movedFsNode: FsNode
  newFsNode: FsNode
}
export function moveSuccess(movedFsNode: FsNode, newFsNode: FsNode): MoveSuccess {
  return { type: "MoveSuccess", movedFsNode, newFsNode }
}

export interface MoveError extends Action {
  type: "MoveError"
  error: ApiError
}
export function moveError(error: ApiError): MoveError {
  return { type: "MoveError", error }
}

export interface ChangeMoveTarget extends Action {
  type: "ChangeMoveTarget"
  path: string
}
export function changeMoveTarget(path: string): ChangeMoveTarget {
  return { type: "ChangeMoveTarget", path }
}
export interface ChangeMoveTargetSuccess extends Action {
  type: "ChangeMoveTargetSuccess"
  target: FsDirectory
}
export function changeMoveTargetSuccess(target: FsDirectory): ChangeMoveTargetSuccess {
  return { type: "ChangeMoveTargetSuccess", target }
}

export interface ChangeMoveTargetError extends Action {
  type: "ChangeMoveTargetError"
  error: ApiError
}
export function changeMoveTargetError(error: ApiError): ChangeMoveTargetError {
  return { type: "ChangeMoveTargetError", error }
}
