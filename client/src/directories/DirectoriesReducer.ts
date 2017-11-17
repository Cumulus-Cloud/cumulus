import { DirectoriesAction } from "directories/DirectoriesActions"
import { Directory } from "models/FsNode"

export interface DirectoriesState {
  directory?: Directory
  loading: boolean
  error?: any
}

const initState: DirectoriesState = {
  loading: false,
  error: undefined
}

export const DirectoriesReducer = (state: DirectoriesState = initState, action: DirectoriesAction) => {
  switch (action.type) {
    case "OnFetchDirectory": return { ...state, loading: true }
    case "OnFetchDirectorySuccess": return { ...state, directory: action.directory, loading: false }
    case "OnFetchDirectoryError": return { ...state, error: action.error, loading: false }
    case "OnCreateNewFolderSuccess": {
      if (state.directory) {
        return { ...state, directory: { ...state.directory, content: [...state.directory.content, action.newFolder] } }
      } else {
        return state
      }
    }
    default: return state
  }
}
