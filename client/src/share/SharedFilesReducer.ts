import { FsNode } from "models/FsNode"
import { SharedFilesAction } from "share/SbaredFilesActions"

export interface SharedFilesState {
  sharedFiles: FsNode[]
}

const initState: SharedFilesState = {
  sharedFiles: []
}

export const SharedFilesReducer = (state: SharedFilesState = initState, action: SharedFilesAction) => {
  switch (action.type) {
    case "FetchSharedFiles": return state
    default: return state
  }
}
