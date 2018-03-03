import { FileSystemAction, DeleteFsNodeSuccess, ShowFsNodeInfos, SelectFsNode } from "./FileSystemActions"
import { FsNode, FsFile, isDirectory, FsDirectory } from "models/FsNode"
import { Share } from "models/Share"
import { ApiError } from "services/Api"
import { CreateNewFolderSuccess } from "files/newFolder/NewFolderActions"
import { UploadFileSuccess } from "files/upload/UploadActions"
import { MoveSuccess } from "files/move/MoveActions"
import { RenameSuccess } from "files/rename/RenameActions"

export interface FileSystemState {
  directory?: FsDirectory
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

// tslint:disable-next-line:cyclomatic-complexity
export const FileSystemReducer = (state: FileSystemState = initState, action: FileSystemAction) => {
  switch (action.type) {
    case "FetchDirectory": return { ...state, loading: true }
    case "FetchDirectorySuccess": return { ...state, directory: action.directory, loading: false }
    case "FetchDirectoryError": return { ...state, error: action.error, loading: false }
    case "CreateNewFolderSuccess": return createNewFolderSuccessReduce(state, action)
    case "DeleteFsNode": return { ...state, deleteLoading: action.fsNode.id }
    case "DeleteFsNodeSuccess": return deleteFsNodeSuccessReducer(state, action)
    case "DeleteFsNodeError": return { ...state, error: action.error, deleteLoading: undefined }
    case "UploadFileSuccess": return uploadFileSuccessReducer(state, action)
    case "ShowPreview": return { ...state, previewFsFile: action.fsFile }
    case "Sharing": return { ...state, sharingLoader: true }
    case "SharingSuccess": return { ...state, sharingLoader: false, sharedFsNode: action.fsNode, share: action.share }
    case "SharingError": return { ...state, sharingLoader: false, error: action.error, sharedFsNode: undefined, share: undefined }
    case "CloseShare": return { ...state, sharedFsNode: undefined, share: undefined }
    case "ShowFsNodeInfos": return showFsNodeInfosReducer(state, action)
    case "HideFsNodeInfos": return { ...state, fsNodeInfosToShow: undefined, selectedFsNodes: [] }
    case "SelectFsNode": return selectFsNodeReducer(state, action)
    case "DeselectFsNode": return { ...state, selectedFsNodes: state.selectedFsNodes.filter(n => n.id !== action.fsNode.id) }
    case "CanselSelectionOfFsNode": return { ...state, selectedFsNodes: [], fsNodeInfosToShow: undefined }
    case "MoveSuccess": return moveSuccessReducer(state, action)
    case "RenameSuccess": return renameSuccessReducer(state, action)
    default: return state
  }
}

function moveSuccessReducer(state: FileSystemState, action: MoveSuccess): FileSystemState {
  const newDirectory = { ...state.directory!, content: state.directory!.content.filter(n => n.id !== action.movedFsNode.id) }
  return {
    ...state,
    directory: newDirectory
  }
}

function renameSuccessReducer(state: FileSystemState, action: RenameSuccess): FileSystemState {
  const directory = { ...state.directory!, content: state.directory!.content.map(n => {
    if (n.id === action.fsNode.id) {
      return action.fsNode
    } else {
      return n
    }
  }) }
  return { ...state, directory }
}

function selectFsNodeReducer(state: FileSystemState, action: SelectFsNode): FileSystemState {
  if (state.selectedFsNodes.find(n => n.id === action.fsNode.id) === undefined) {
    return { ...state, selectedFsNodes: [...state.selectedFsNodes, action.fsNode] }
  } else {
    return { ...state, selectedFsNodes: state.selectedFsNodes.filter(n => n.id !== action.fsNode.id) }
  }
}

function showFsNodeInfosReducer(state: FileSystemState, action: ShowFsNodeInfos): FileSystemState {
  if (state.fsNodeInfosToShow && state.fsNodeInfosToShow.id === action.fsNode.id) {
    return { ...state, fsNodeInfosToShow: undefined }
  } else {
    return { ...state, fsNodeInfosToShow: action.fsNode }
  }
}

function createNewFolderSuccessReduce(state: FileSystemState, action: CreateNewFolderSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    return { ...state, directory: { ...state.directory, content: [...state.directory.content, action.newFolder] } }
  } else {
    return state
  }
}

function uploadFileSuccessReducer(state: FileSystemState, action: UploadFileSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    const newFsNode = { ...state.directory, content: [...state.directory.content, action.fsNode] }
    return { ...state, directory: newFsNode }
  } else {
    return state
  }
}

function deleteFsNodeSuccessReducer(state: FileSystemState, action: DeleteFsNodeSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    const newFsNode = { ...state.directory, content: state.directory.content.filter(fsNode => fsNode.id !== action.fsNode.id) }
    return { ...state, directory: newFsNode, deleteLoading: undefined }
  } else {
    return { ...state, deleteLoading: undefined }
  }
}
