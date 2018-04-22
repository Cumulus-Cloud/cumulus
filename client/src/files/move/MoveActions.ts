import { buildAction, ActionsUnion } from "typesafe-actions"
import { FsNode, FsDirectory } from "models/FsNode"
import { ApiError } from "models/ApiError"

export const MoveActions = {
  wantMove: buildAction("WantMove").payload<{ fsNodes: FsNode[], target: FsDirectory }>(),
  cancelMove: buildAction("CancelMove").empty(),
  move: buildAction("Move").payload<{ fsNodeToMove: FsNode, target: FsDirectory }>(),
  moveSuccess: buildAction("MoveSuccess").payload<{ fsNodeToMove: FsNode, movedfsNode: FsNode }>(),
  moveError: buildAction("MoveError").payload<{ error: ApiError }>(),
  changeMoveTarget: buildAction("ChangeMoveTarget").payload<{ path: string }>(),
  changeMoveTargetSuccess: buildAction("ChangeMoveTargetSuccess").payload<{ target: FsDirectory }>(),
  changeMoveTargetError: buildAction("ChangeMoveTargetError").payload<{ error: ApiError }>(),
}

export type MoveAction = ActionsUnion<typeof MoveActions>
