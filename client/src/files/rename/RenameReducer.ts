import { getType } from "typesafe-actions"
import { RenameActions } from "files/rename/RenameActions"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"
import { Actions } from "actions"

export interface RenameState {
  newName: string
  fsNodeToRename?: FsNode
  loading: boolean
  error?: ApiError
}

const initState: RenameState = {
  newName: "",
  loading: false,
}

export const RenameReducer = (state: RenameState = initState, action: Actions) => {
  switch (action.type) {
    case getType(RenameActions.wantRename): return { ...state, newName: action.payload.fsNode.name, fsNodeToRename: action.payload.fsNode }
    case getType(RenameActions.changeName): return { ...state, newName: action.payload.name }
    case getType(RenameActions.cancelRename): return { ...state, newName: "", fsNodeToRename: undefined }
    case getType(RenameActions.rename): return { ...state, loading: true }
    case getType(RenameActions.renameSuccess): return { ...state, loading: false, fsNodeToRename: undefined }
    case getType(RenameActions.renameError): return { ...state, loading: false, error: action.payload.error }
    default: return state
  }
}
