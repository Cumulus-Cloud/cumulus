import { Reducer } from 'redux'

import FsState from './fsState'
import { FsActions } from './fsActions'

const initialState: FsState = {
  loadingCurrent: false,
  loadingContent: false
}

const reducer: Reducer<FsState, FsActions> = (state: FsState = initialState, action: FsActions) => {
  switch(action.type) {
    case 'FS/GET_DIRECTORY':
      return {
        ...state,
        loadingCurrent: true,
        loadingContent: true,
        error: undefined
      }
    case 'FS/GET_DIRECTORY_SUCCESS':
      return {
        ...state,
        loadingCurrent: false,
        loadingContent: false,
        current: action.payload.directory,
        content: action.payload.directory.content, // We switched directory, so also switch the content
        error: undefined
      }
    case 'FS/GET_DIRECTORY_FAILURE':
      return {
        ...state,
        loadingCurrent: false,
        loadingContent: false,
        current: undefined,
        content: undefined,
        error: action.payload.error
      }
    case 'FS/GET_DIRECTORY_CONTENT':
      return {
        ...state,
        loadingContent: true,
        error: undefined
      }
    case 'FS/GET_DIRECTORY_CONTENT/SUCCESS':
      // TODO handle duplicates + offset and hasMore flag (pagination sever site ? proper endpoint ?)
      return {
        ...state,
        loadingContent: false,
        content: state.content ? state.content.concat(action.payload.content) : action.payload.content,
        error: undefined
      }
    case 'FS/GET_DIRECTORY_CONTENT/FAILURE':
      return {
        ...state,
        loadingContent: false,
        error: action.payload.error
      }
      return state
    default:
      return state
  }
}

export default reducer