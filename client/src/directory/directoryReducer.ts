import { DirectoryAction } from "./DirectoryActions"


export type Loading = "CreateDirectory"

export interface DirectoryState {
  newDirectoryName: string
  isNewDirectoryOpen: boolean
  loading?: Loading
}

const initState: DirectoryState = {
  newDirectoryName: "lol",
  isNewDirectoryOpen: false,
}
export const DirectoryReducer = (state: DirectoryState = initState, action: DirectoryAction) => {
  switch (action.type) {
    case "CHANGE_NEW_DIRECTORY_NAME": return { ...state, newDirectoryName: action.name }
    case "TOGGLE_CREATE_NEW_DIRECTORY": return { ...state, isNewDirectoryOpen: !state.isNewDirectoryOpen }
    default: return state
  }
}

/*
import { Directory } from "../models/FsNode"
import * as Api from "../services/Api"

import {
  ADD_DIRECTORY_ACTION,
  LOADING_ACTION,
  ADD_CREATED_FS_NODE,
  TOGGLE_CREATE_NEW_DIRECTORY,
  CHANGE_NEW_DIRECTORY_NAME,
  CREATE_DIRECTORY_ERRORS,
} from "./directoryActions"

export interface DirectoryState {
  loading: boolean
  directory?: Directory

  whantCreateNewDirectory: boolean
  newDirectoryName: string
  errors?: Api.Errors
}

const initDirectoryState: DirectoryState = {
  loading: false,
  whantCreateNewDirectory: false,
  newDirectoryName: "",
}

export function directoryReducer(state: DirectoryState = initDirectoryState, action: AppAction): DirectoryState {
  switch (action.type) {
    case TOGGLE_CREATE_NEW_DIRECTORY: return {
      ...state,
      whantCreateNewDirectory: !state.whantCreateNewDirectory,
      newDirectoryName: "",
      errors: undefined,
    }
    case CHANGE_NEW_DIRECTORY_NAME: return {
      ...state,
      newDirectoryName: getActionPayload<string>(action)
    }
    case CREATE_DIRECTORY_ERRORS: return {
      ...state,
      errors: getActionPayload<Api.Errors>(action)
    }
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
        whantCreateNewDirectory: false,
        newDirectoryName: "",
        errors: undefined,
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
*/