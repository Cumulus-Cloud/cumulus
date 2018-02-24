import { MoveAction } from "move/MoveActions"
import { ApiError } from "services/Api"
import { FsNode, FsDirectory } from "models/FsNode"

export interface MoveState {
  wantMove: boolean
  fsNodes: FsNode[]
  target?: FsDirectory
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
    case "WantMove": return { ...state, wantMove: true, fsNodes: action.fsNodes, target: action.target }
    case "CancelMove": return { ...state, wantMove: false, fsNodes: [], target: undefined }
    case "ChangeMoveTarget": return { ...state, target: action.target }
    default: return state
  }
}
