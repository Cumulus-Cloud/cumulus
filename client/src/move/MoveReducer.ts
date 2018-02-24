import { MoveAction } from "move/MoveActions"
import { ApiError } from "services/Api"
import { FsNode } from "models/FsNode"

export interface MoveState {
  wantMove: boolean
  fsNodes: FsNode[]
  targetFsNode?: FsNode
  loading: false
  error?: ApiError
}

const initState: MoveState = {
  wantMove: false,
  fsNodes: [],
  loading: false,
}

export const MoveReducer = (state: MoveState = initState, action: MoveAction) => {
  switch (action.type) {
    case "WantMove": return { wantMove: true, fsNodes: action.fsNodes, targetFsNode: action.targetFsNode }
    case "CancelMove": return { wantMove: false, fsNodes: [], targetFsNode: undefined }
    default: return state
  }
}
