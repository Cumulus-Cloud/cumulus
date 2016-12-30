import { Action } from "redux"
import { Directory } from "../models/FsNode"
import * as Api from "../services/Api"

import { ADD_DIRECTORY_ACTION } from "./directoryActions"

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
        directory: (action as any).directory
      }
    default:
      return state
  }
}
