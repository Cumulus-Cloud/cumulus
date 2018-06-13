import { Directory } from "../models/FsNode"

import { Reducer, AnyAction } from 'redux'
import { DirectoryActions, LoadDirectoryAction } from './actions'
import { ApiError } from "../models/ApiError";

export interface State {
  loading: Boolean
  error?: ApiError
  current?: Directory
  selectedElements?: string[]
}

const initialState: State = {
  loading: true
}

const reducer: Reducer<State, DirectoryActions> = (state: State = initialState, action: DirectoryActions) => {
  switch(action.type) {
    case 'LOAD_DIRECTORY':
      return { loading: true }
    case 'LOAD_DIRECTORY_SUCCESS':
      return { loading: false, current: action.payload.directory, selectedElements: [] }
    case 'LOAD_DIRECTORY_FAILURE':
      return { loading: false, error: action.payload.error }
    default:
      return state
  }
}

export default reducer