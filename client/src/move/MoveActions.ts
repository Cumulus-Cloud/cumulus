import { FsNode } from "models/FsNode"

export type MoveAction = WantMove | CancelMove

export type WantMove = { type: "WantMove", fsNodes: FsNode[], targetFsNode: FsNode }
export const wantMove = (fsNodes: FsNode[], targetFsNode: FsNode): WantMove => ({ type: "WantMove", fsNodes, targetFsNode })

export type CancelMove = { type: "CancelMove" }
export const cancelMove = (): CancelMove => ({ type: "CancelMove" })

export type Move = { type: "Move" }
export const move = (): Move => ({ type: "Move" })

export const actions = {
  wantMove,
  cancelMove,
  move,
}
