import { DirectoriesAction } from "directories/DirectoriesActions"
import { FsNode, isDirectory } from "models/FsNode"
import { ApiError } from "services/Api"

export interface DirectoriesState {
  directory?: FsNode
  loading: boolean
  deleteLoading?: string
  error?: ApiError
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
      if (state.directory && isDirectory(state.directory)) {
        return { ...state, directory: { ...state.directory, content: [...state.directory.content, action.newFolder] } }
      } else {
        return state
      }
    }

    case "OnDeleteFsNode": return { ...state, deleteLoading: action.fsNode.id }
    case "OnDeleteFsNodeSuccess": {
      if (state.directory && isDirectory(state.directory)) {
        const newFsNode = { ...state.directory, content: state.directory.content.filter(fsNode => fsNode.id !== action.fsNode.id) }
        return { ...state, directory: newFsNode, deleteLoading: undefined }
      } else {
        return { ...state, deleteLoading: undefined }
      }
    }
    case "OnDeleteFsNodeError": return { ...state, error: action.error, deleteLoading: undefined }
    case "OnUploadFileSuccess": {
      if (state.directory && isDirectory(state.directory)) {
        const newFsNode = { ...state.directory, content: [...state.directory.content, action.fsNode] }
        return { ...state, directory: newFsNode }
      } else {
        return state
      }
    }
    default: return state
  }
}
