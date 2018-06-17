import { Reducer } from 'redux'

import FsState from './fsState'
import { FsActions } from './fsActions'

const initialState: FsState = {
  loadingCurrent: false
}

const reducer: Reducer<FsState, FsActions> = (state: FsState = initialState, action: FsActions) => {
  switch(action.type) {
    case 'FS/GET_DIRECTORY':
      return { ...state, loadingCurrent: true, error: undefined }
    case 'FS/GET_DIRECTORY_SUCCESS':
      return { ...state, loadingCurrent: false, current: action.payload.directory, error: undefined }
    case 'FS/GET_DIRECTORY_FAILURE':
      return { ...state, loadingCurrent: false, current: undefined, error: action.payload.error }
    case 'FS/CREATE_DIRECTORY':
      return { ...state, error: undefined }
    case 'FS/CREATE_DIRECTORY_SUCCESS':
      return { ...state, error: undefined }
    case 'FS/CREATE_DIRECTORY_FAILURE':
      return { ...state, error: action.payload.error }
    default:
      return state
  }
}

export default reducer