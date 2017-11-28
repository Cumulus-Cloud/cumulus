import { PreviewAction } from "./PreviewActions"
import { FsNode } from "models/FsNode"

export interface PreviewState {
  fsNode?: FsNode
}

const initState: PreviewState = {}

export const PreviewReducer = (state: PreviewState = initState, action: PreviewAction) => {
  switch (action.type) {
    case "ShowPreview": return { ...state, fsNode: action.fsNode }
    default: return state
  }
}
