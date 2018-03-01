import * as Api from "services/Api"
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

export type WantMove = { type: "WantMove", fsNodes: FsNode[], target: FsDirectory }
export const wantMove = (fsNodes: FsNode[], target: FsDirectory): WantMove => ({ type: "WantMove", fsNodes, target })

export type CancelMove = { type: "CancelMove" }
export const cancelMove = (): CancelMove => ({ type: "CancelMove" })

export type Move = { type: "Move" }
export function move(): Move {
  return { type: "Move" }
}

export type MoveSuccess = { type: "MoveSuccess", movedFsNode: FsNode, newFsNode: FsNode }
export const moveSuccess = (movedFsNode: FsNode, newFsNode: FsNode): MoveSuccess => ({ type: "MoveSuccess", movedFsNode, newFsNode })

export type MoveError = { type: "MoveError", error: Api.ApiError }
export const moveError = (error: Api.ApiError): MoveError => ({ type: "MoveError", error })

export type ChangeMoveTarget = { type: "ChangeMoveTarget", path: string }
export function changeMoveTarget(path: string): ChangeMoveTarget {
  return { type: "ChangeMoveTarget", path }
}
export type ChangeMoveTargetSuccess = { type: "ChangeMoveTargetSuccess", target: FsDirectory }
export const changeMoveTargetSuccess = (target: FsDirectory): ChangeMoveTargetSuccess => ({ type: "ChangeMoveTargetSuccess", target })

export type ChangeMoveTargetError = { type: "ChangeMoveTargetError", error: Api.ApiError }
export const changeMoveTargetError = (error: Api.ApiError): ChangeMoveTargetError => ({ type: "ChangeMoveTargetError", error })
