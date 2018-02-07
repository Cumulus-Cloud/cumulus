import { FileSystemAction, OnDeleteFsNodeSuccess, ShowFsNodeInfos, SelectFsNode } from "./FileSystemActions"
import { FsNode, FsFile, isDirectory } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "services/Api"
import { OnCreateNewFolderSuccess } from "newFolder/NewFolderActions"
import { OnUploadFileSuccess } from "upload/UploadActions"

export interface FileSystemState {
  directory?: FsNode
  loading: boolean
  deleteLoading?: string
  error?: ApiError
  previewFsFile?: FsFile
  sharedFsNode?: FsNode
  share?: Share
  sharingLoader: boolean
  fsNodeInfosToShow?: FsNode
  selectedFsNodes: FsNode[]
}

const initState: FileSystemState = {
  loading: false,
  sharingLoader: false,
  error: undefined,
  selectedFsNodes: [],
}

export const FileSystemReducer = (state: FileSystemState = initState, action: FileSystemAction) => {
  switch (action.type) {
    case "FetchDirectory": return { ...state, loading: true }
    case "FetchDirectorySuccess": return { ...state, directory: action.directory, loading: false }
    case "FetchDirectoryError": return { ...state, error: action.error, loading: false }
    case "OnCreateNewFolderSuccess": return onCreateNewFolderSuccessReduce(state, action)
    case "OnDeleteFsNode": return { ...state, deleteLoading: action.fsNode.id }
    case "OnDeleteFsNodeSuccess": return onDeleteFsNodeSuccessReducer(state, action)
    case "OnDeleteFsNodeError": return { ...state, error: action.error, deleteLoading: undefined }
    case "OnUploadFileSuccess": return onUploadFileSuccessReducer(state, action)
    case "ShowPreview": return { ...state, previewFsFile: action.fsFile }
    case "Sharing": return { ...state, sharingLoader: true }
    case "SharingSuccess": return { ...state, sharingLoader: false, sharedFsNode: action.fsNode, share: action.share }
    case "SharingError": return { ...state, sharingLoader: false, error: action.error, sharedFsNode: undefined, share: undefined }
    case "CloseShare": return { ...state, sharedFsNode: undefined, share: undefined }
    case "ShowFsNodeInfos": return showFsNodeInfosReducer(state, action)
    case "HideFsNodeInfos": return { ...state, fsNodeInfosToShow: undefined }
    case "SelectFsNode": return selectFsNodeReducer(state, action)
    default: return state
  }
}

function selectFsNodeReducer(state: FileSystemState, action: SelectFsNode): FileSystemState {
  return state
}

function showFsNodeInfosReducer(state: FileSystemState, action: ShowFsNodeInfos): FileSystemState {
  if (state.fsNodeInfosToShow && state.fsNodeInfosToShow.id === action.fsNode.id) {
    return { ...state, fsNodeInfosToShow: undefined }
  } else {
    return { ...state, fsNodeInfosToShow: action.fsNode }
  }
}

function onCreateNewFolderSuccessReduce(state: FileSystemState, action: OnCreateNewFolderSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    return { ...state, directory: { ...state.directory, content: [...state.directory.content, action.newFolder] } }
  } else {
    return state
  }
}

function onUploadFileSuccessReducer(state: FileSystemState, action: OnUploadFileSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    const newFsNode = { ...state.directory, content: [...state.directory.content, action.fsNode] }
    return { ...state, directory: newFsNode }
  } else {
    return state
  }
}

function onDeleteFsNodeSuccessReducer(state: FileSystemState, action: OnDeleteFsNodeSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    const newFsNode = { ...state.directory, content: state.directory.content.filter(fsNode => fsNode.id !== action.fsNode.id) }
    return { ...state, directory: newFsNode, deleteLoading: undefined }
  } else {
    return { ...state, deleteLoading: undefined }
  }
}
