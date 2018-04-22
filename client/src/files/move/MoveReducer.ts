import { getType } from "typesafe-actions"
import { MoveActions } from "files/move/MoveActions"
import { FsNode, FsDirectory } from "models/FsNode"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

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

export const MoveReducer = (state: MoveState = initState, action: Actions) => {
  switch (action.type) {
    case getType(MoveActions.wantMove): return { ...state, wantMove: true, fsNodes: action.payload.fsNodes, target: action.payload.target }
    case getType(MoveActions.cancelMove): return initState
    case getType(MoveActions.changeMoveTarget): return { ...state, targetLoading: true }
    case getType(MoveActions.changeMoveTargetSuccess): return { ...state, target: action.payload.target, targetLoading: false }
    case getType(MoveActions.changeMoveTargetError): return { ...state, targetLoading: false }
    case getType(MoveActions.move): return { ...state, loading: true }
    case getType(MoveActions.moveSuccess): return { ...state, loading: false, wantMove: false }
    case getType(MoveActions.moveError): return { ...state, error: action.payload.error, loading: false }
    default: return state
  }
}
