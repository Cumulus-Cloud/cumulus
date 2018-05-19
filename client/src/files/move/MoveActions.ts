import { createAction, ActionType } from "typesafe-actions"
import { FsNode, FsDirectory } from "models/FsNode"
import { ApiError } from "models/ApiError"

export const MoveActions = {
  wantMove: createAction("WantMove", resolve => (fsNodes: FsNode[], target: FsDirectory) => resolve({ fsNodes, target })),
  cancelMove: createAction("CancelMove"),
  move: createAction("Move", resolve => (fsNodeToMove: FsNode, target: FsDirectory) => resolve({ fsNodeToMove, target })),
  moveSuccess: createAction("MoveSuccess", resolve => (fsNodeToMove: FsNode, movedfsNode: FsNode) => resolve({ fsNodeToMove, movedfsNode })),
  moveError: createAction("MoveError", resolve => (error: ApiError) => resolve({ error })),
  changeMoveTarget: createAction("ChangeMoveTarget", resolve => (path: string) => resolve({ path })),
  changeMoveTargetSuccess: createAction("ChangeMoveTargetSuccess", resolve => (target: FsDirectory) => resolve({ target })),
  changeMoveTargetError: createAction("ChangeMoveTargetError", resolve => (error: ApiError) => resolve({ error })),
}

export type MoveAction = ActionType<typeof MoveActions>
