import { getType } from "typesafe-actions"
import { FileSystemActions } from "files/fileSystem/FileSystemActions"
import { FsNode, FsFile, isDirectory, FsDirectory } from "models/FsNode"
import { Share } from "models/Share"
import { NewFolderActions } from "files/newFolder/NewFolderActions"
import { UploadFileSuccess } from "files/upload/UploadActions"
import { MoveActions } from "files/move/MoveActions"
import { RenameSuccess } from "files/rename/RenameActions"
import { ApiError } from "models/ApiError"
import { Actions } from "actions";

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
export const FileSystemReducer = (state: FileSystemState = initState, action: Actions) => {
  switch (action.type) {
    case getType(FileSystemActions.fetchDirectory): return { ...state, loading: true }
    case getType(FileSystemActions.fetchDirectorySuccess): return { ...state, directory: action.payload.directory, loading: false }
    case getType(FileSystemActions.fetchDirectoryError): return { ...state, error: action.payload.error, loading: false }
    case getType(FileSystemActions.deleteFsNode): return { ...state, deleteLoading: action.payload.fsNode.id }
    case getType(FileSystemActions.deleteFsNodeSuccess): {
      if (state.directory && isDirectory(state.directory)) {
        const newFsNode = { ...state.directory, content: state.directory.content.filter(fsNode => fsNode.id !== action.payload.fsNode.id) }
        return { ...state, directory: newFsNode, deleteLoading: undefined }
      } else {
        return { ...state, deleteLoading: undefined }
      }
    }
    case getType(FileSystemActions.deleteFsNodeError): return { ...state, error: action.payload.error, deleteLoading: undefined }
    case getType(FileSystemActions.showPreview): return { ...state, previewFsFile: action.payload.fsFile }
    case getType(FileSystemActions.sharing): return { ...state, sharingLoader: true }
    case getType(FileSystemActions.sharingSuccess): return {
      ...state,
      sharingLoader: false,
      sharedFsNode: action.payload.fsNode,
      share: action.payload.share
    }
    case getType(FileSystemActions.sharingError): return {
      ...state,
      sharingLoader: false,
      error: action.payload.error,
      sharedFsNode: undefined,
      share: undefined
    }
    case getType(FileSystemActions.closeShare): return { ...state, sharedFsNode: undefined, share: undefined }
    case getType(FileSystemActions.showFsNodeInfos): {
      if (state.fsNodeInfosToShow && state.fsNodeInfosToShow.id === action.payload.fsNode.id) {
        return { ...state, fsNodeInfosToShow: undefined }
      } else {
        return { ...state, fsNodeInfosToShow: action.payload.fsNode }
      }
    }
    case getType(FileSystemActions.hideFsNodeInfos): return { ...state, fsNodeInfosToShow: undefined, selectedFsNodes: [] }
    case getType(FileSystemActions.selectFsNode): {
      if (state.selectedFsNodes.find(n => n.id === action.payload.fsNode.id) === undefined) {
        return { ...state, selectedFsNodes: [...state.selectedFsNodes, action.payload.fsNode] }
      } else {
        return { ...state, selectedFsNodes: state.selectedFsNodes.filter(n => n.id !== action.payload.fsNode.id) }
      }
    }
    case getType(FileSystemActions.deselectFsNode): return {
      ...state,
      selectedFsNodes: state.selectedFsNodes.filter(n => n.id !== action.payload.fsNode.id)
    }
    case getType(FileSystemActions.canselSelectionOfFsNode): return { ...state, selectedFsNodes: [], fsNodeInfosToShow: undefined }
    case "UploadFileSuccess": return uploadFileSuccessReducer(state, action)
    case getType(NewFolderActions.createNewFolderSuccess): {
      if (state.directory && isDirectory(state.directory)) {
        return { ...state, directory: { ...state.directory, content: [...state.directory.content, action.payload.newFolder] } }
      } else {
        return state
      }
    }
    case getType(MoveActions.moveSuccess): {
      const newDirectory = { ...state.directory!, content: state.directory!.content.filter(n => n.id !== action.payload.fsNodeToMove.id) }
      return {
        ...state,
        directory: newDirectory
      }
    }
    case "RenameSuccess": return renameSuccessReducer(state, action)
    default: return state
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

function uploadFileSuccessReducer(state: FileSystemState, action: UploadFileSuccess): FileSystemState {
  if (state.directory && isDirectory(state.directory)) {
    const newFsNode = { ...state.directory, content: [...state.directory.content, action.fsNode] }
    return { ...state, directory: newFsNode }
  } else {
    return state
  }
}
