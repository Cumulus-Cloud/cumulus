import { FsNode, FsDirectory } from "models/FsNode"

export type MoveAction = WantMove | CancelMove | ChangeMoveTarget

export type WantMove = { type: "WantMove", fsNodes: FsNode[], target: FsDirectory }
export const wantMove = (fsNodes: FsNode[], target: FsDirectory): WantMove => ({ type: "WantMove", fsNodes, target })

export type CancelMove = { type: "CancelMove" }
export const cancelMove = (): CancelMove => ({ type: "CancelMove" })

export type Move = { type: "Move" }
export const move = (): Move => ({ type: "Move" })

export type ChangeMoveTarget = { type: "ChangeMoveTarget", target: FsDirectory }
export const changeMoveTarget = (target: FsDirectory): ChangeMoveTarget => ({ type: "ChangeMoveTarget", target })

export const actions = {
  wantMove,
  cancelMove,
  move,
  changeMoveTarget,
}
