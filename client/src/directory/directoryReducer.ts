import { Action } from "redux"
import { Directory } from "../models/FsNode"
import * as Api from "../services/Api"

import { ADD_DIRECTORY_ACTION, LOADING_ACTION, ADD_CREATED_FS_NODE } from "./directoryActions"

export interface DirectoryState {
  loading: boolean
  directory?: Directory
}

const initDirectoryState: DirectoryState = {
  loading: false
}

export function directoryReducer(state: DirectoryState = initDirectoryState, action: Action): DirectoryState {
  switch (action.type) {
    case ADD_DIRECTORY_ACTION:
      return {
        ...state,
        directory: (action as any).directory,
        loading: false,
      }
    case LOADING_ACTION:
      return {
        ...state,
        loading: (action as any).loading,
      }
    case ADD_CREATED_FS_NODE:
      return {
        ...state,
        directory: {
          ...state.directory,
          content: [
            ...(state.directory && state.directory.content ? state.directory.content : []),
            (action as any).fsNode
          ]
        }
      }
    default:
      return state
  }
}
