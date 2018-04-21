import { RenameAction } from "files/rename/RenameActions"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"

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

export const RenameReducer = (state: RenameState = initState, action: RenameAction) => {
  switch (action.type) {
    case "WantRename": return { ...state, newName: action.fsNode.name, fsNodeToRename: action.fsNode }
    case "ChangeName": return { ...state, newName: action.name }
    case "CancelRename": return { ...state, newName: "", fsNodeToRename: undefined }
    case "Rename": return { ...state, loading: true }
    case "RenameSuccess": return { ...state, loading: false, fsNodeToRename: undefined }
    case "RenameError": return { ...state, loading: false, error: action.error }
    default: return state
  }
}
