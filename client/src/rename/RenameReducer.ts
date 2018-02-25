import { RenameAction } from "rename/RenameActions"
// import { ApiError } from "services/Api"
import { FsNode } from "models/FsNode"

export interface RenameState {
  newName: string
  fsNodeToRename?: FsNode
}

const initState: RenameState = {
  newName: ""
}

export const RenameReducer = (state: RenameState = initState, action: RenameAction) => {
  switch (action.type) {
    case "WantRename": return { ...state, newName: action.fsNode.name, fsNodeToRename: action.fsNode }
    case "ChangeName": return { ...state, newName: action.name }
    case "CancelRename": return { ...state, newName: "", fsNodeToRename: undefined }
    default: return state
  }
}
