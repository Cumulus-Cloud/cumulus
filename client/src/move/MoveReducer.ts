import { MoveAction } from "move/MoveActions"
import { ApiError } from "services/Api"
import { FsNode, FsDirectory } from "models/FsNode"

export interface MoveState {
  wantMove: boolean
  fsNodes: FsNode[]
  target?: FsDirectory
  loading: false
  targetLoading: boolean
  error?: ApiError
}

const initState: MoveState = {
  wantMove: false,
  fsNodes: [],
  loading: false,
  targetLoading: false,
}

export const MoveReducer = (state: MoveState = initState, action: MoveAction) => {
  switch (action.type) {
    case "WantMove": return { ...state, wantMove: true, fsNodes: action.fsNodes, target: action.target }
    case "CancelMove": return initState
    case "ChangeMoveTarget": return { ...state, targetLoading: true }
    case "ChangeMoveTargetSuccess": return { ...state, target: action.target, targetLoading: false }
    case "ChangeMoveTargetSuccessError": return { ...state, targetLoading: false }
    default: return state
  }
}
