import { Reducer } from 'redux'

import CreateDirectoryState from './createDirectoryState'
import { CreateDirectoryActions } from './createDirectoryActions'

const initialState: CreateDirectoryState = {
  loading: false
}

const reducer: Reducer<CreateDirectoryState, CreateDirectoryActions> = (state: CreateDirectoryState = initialState, action: CreateDirectoryActions) => {
  switch(action.type) {
    case 'FS/CREATE_DIRECTORY':
      return { loading: true }
    case 'FS/CREATE_DIRECTORY/SUCCESS':
      return { loading: false, createdDirectory: action.payload.directory }
    case 'FS/CREATE_DIRECTORY/FAILURE':
      return { loading: false, error: action.payload.error }
    default:
      return state
  }
}

export default reducer
