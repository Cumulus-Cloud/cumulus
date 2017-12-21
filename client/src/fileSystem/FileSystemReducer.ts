import { FileSystemAction } from "./FileSystemActions"
import { FsNode, FsFile, isDirectory } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "services/Api"

export interface FileSystemState {
  directory?: FsNode
  loading: boolean
  deleteLoading?: string
  error?: ApiError
  previewFsFile?: FsFile
  sharedFsNode?: FsNode
  share?: Share
  sharingLoader: boolean
}

const initState: FileSystemState = {
  loading: false,
  sharingLoader: false,
  error: undefined,
}

export const FileSystemReducer = (state: FileSystemState = initState, action: FileSystemAction) => {
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
    case "ShowPreview": return { ...state, previewFsFile: action.fsFile }
    case "Sharing": return { ...state, sharingLoader: true }
    case "SharingSuccess": return { ...state, sharingLoader: false, sharedFsNode: action.fsNode, share: action.share }
    case "SharingError": return { ...state, sharingLoader: false, error: action.error, sharedFsNode: undefined, share: undefined }
    case "CloseShare": return { ...state, sharedFsNode: undefined, share: undefined }
    default: return state
  }
}
