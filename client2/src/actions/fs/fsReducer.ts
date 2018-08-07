import { Reducer } from 'redux'

import FsState from './fsState'
import { FsActions } from './fsActions'

const initialState: FsState = {
  loadingCurrent: false,
  loadingContent: false,
  selectedContent: { type: 'NONE' }
}

const reducer: Reducer<FsState, FsActions> = (state: FsState = initialState, action: FsActions) => {
  switch(action.type) {
    case 'FS/GET_DIRECTORY':
      return {
        ...state,
        loadingCurrent: true,
        loadingContent: false,
        selectedContent: { type: 'NONE' },
        error: undefined
      }
    case 'FS/GET_DIRECTORY_SUCCESS':
      return {
        ...state,
        loadingCurrent: false,
        loadingContent: false,
        current: action.payload.directory,
        content: undefined, // We switched directory, so also switch the loaded content
        contentSize: undefined,
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
        contentSize: action.payload.contentSize,
        error: undefined
      }
    case 'FS/GET_DIRECTORY_CONTENT/FAILURE':
      return {
        ...state,
        loadingContent: false,
        error: action.payload.error
      }
    case 'FS/SELECT_NODE':
      switch(state.selectedContent.type) {
        case 'ALL':
          return state
        case 'NONE':
          return {
            ...state,
            selectedContent : {
              type: 'SOME',
              selectedElements: [ action.payload.id ]
            }
          }
        case 'SOME':
          return {
            ...state,
            selectedContent : {
              type: 'SOME',
              selectedElements: state.selectedContent.selectedElements.concat([ action.payload.id ])
            }
          }
      }
    case 'FS/SELECT_ALL_NODES' :
      return {
        ...state,
        selectedContent: {
          type: 'ALL'
        }
      }
    case 'FS/DESELECT_NODE':
      switch(state.selectedContent.type) {
        case 'ALL': {
          const selection = (state.content || []).map((node) => node.id).filter((id) => id !== action.payload.id)
          return {
            ...state,
            selectedContent: {
              type: 'SOME',
              selectedElements: selection
            }
          }
        }
        case 'NONE':
          return state
        case 'SOME': {
          const selection = state.selectedContent.selectedElements.filter((id) => id !== action.payload.id)
          return {
            ...state,
            selectedContent : selection.length <= 0 ? {
              type: 'NONE'
            } : {
              type: 'SOME',
              selectedElements: selection
            }
          }
        }
      }
    case 'FS/DESELECT_ALL_NODES':
      return {
        ...state,
        selectedContent: {
          type: 'NONE'
        }
      }
    case 'FS/SHOW_NODE_DETAILS':
      return {
        ...state,
        detailed: (state.content || []).find((node) => node.id === action.payload.id)
      }
    default:
      return state
  }
}

export default reducer