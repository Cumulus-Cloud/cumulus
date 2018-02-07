import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { FsNode, FsFile } from "models/FsNode"
import { Share } from "models/Share"
import * as Api from "services/Api"
import { OnCreateNewFolderSuccess } from "newFolder/NewFolderActions"
import { OnUploadFileSuccess } from "upload/UploadActions"

export type FileSystemAction =
  FetchDirectory |
  FetchDirectorySuccess |
  FetchDirectoryError |
  OnCreateNewFolderSuccess |
  OnDeleteFsNode |
  OnDeleteFsNodeSuccess |
  OnDeleteFsNodeError |
  OnUploadFileSuccess |
  ShowPreview |
  Sharing |
  SharingSuccess |
  SharingError |
  CloseShare |
  ShowFsNodeInfos |
  HideFsNodeInfos |
  SelectFsNode |
  DeselectFsNode

export type Sharing = { type: "Sharing", fsNode?: FsNode }
export function onSharing(fsNode: FsNode): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "Sharing", fsNode })
    Api.share(fsNode)
      .then(share => dispatch(onSharingSuccess(share, fsNode)))
      .catch(error => dispatch(onSharingError(error)))
  }
}

export type SharingSuccess = { type: "SharingSuccess", share: Share, fsNode: FsNode }
export const onSharingSuccess = (share: Share, fsNode: FsNode): SharingSuccess => ({ type: "SharingSuccess", share, fsNode })

export type ShowFsNodeInfos = { type: "ShowFsNodeInfos", fsNode: FsNode }
export const showFsNodeInfos = (fsNode: FsNode): ShowFsNodeInfos => ({ type: "ShowFsNodeInfos", fsNode })

export type HideFsNodeInfos = { type: "HideFsNodeInfos", fsNode: FsNode }
export const hideFsNodeInfos = (fsNode: FsNode): HideFsNodeInfos => ({ type: "HideFsNodeInfos", fsNode })

export type SelectFsNode = { type: "SelectFsNode", fsNode: FsNode }
export const selectFsNode = (fsNode: FsNode): SelectFsNode => ({ type: "SelectFsNode", fsNode })

export type DeselectFsNode = { type: "DeselectFsNode", fsNode: FsNode }
export const deselectFsNode = (fsNode: FsNode): DeselectFsNode => ({ type: "DeselectFsNode", fsNode })

export type SharingError = { type: "SharingError", error: Api.ApiError }
export const onSharingError = (error: Api.ApiError): SharingError => ({ type: "SharingError", error })

export type CloseShare = { type: "CloseShare" }
export const onCloseShare = (): CloseShare => ({ type: "CloseShare" })

export type FetchDirectory = { type: "FetchDirectory", path: string }
export function fetchDirectory(path: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "FetchDirectory", path })
    Api.fetchDirectory(path)
      .then(directory => dispatch(fetchDirectorySuccess(directory)))
      .catch(error => dispatch(fetchDirectoryError(error)))
  }
}

export type FetchDirectorySuccess = {
  type: "FetchDirectorySuccess"
  directory: FsNode
}
export const fetchDirectorySuccess = (directory: FsNode): FetchDirectorySuccess => ({
  type: "FetchDirectorySuccess",
  directory
})

export type FetchDirectoryError = {
  type: "FetchDirectoryError"
  error: Api.ApiError
}
export const fetchDirectoryError = (error: Api.ApiError): FetchDirectoryError => ({
  type: "FetchDirectoryError",
  error
})

export type OnDeleteFsNode = {
  type: "OnDeleteFsNode",
  fsNode: FsNode
}
export function onDeleteFsNode(fsNode: FsNode): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "OnDeleteFsNode", fsNode })
    Api.deleteFsNode(fsNode)
      .then(() => dispatch(onDeleteFsNodeSuccess(fsNode)))
      .catch(error => dispatch(onDeleteFsNodeError(error)))
  }
}

export type OnDeleteFsNodeSuccess = {
  type: "OnDeleteFsNodeSuccess",
  fsNode: FsNode
}
export const onDeleteFsNodeSuccess = (fsNode: FsNode): OnDeleteFsNodeSuccess => ({
  type: "OnDeleteFsNodeSuccess",
  fsNode
})

export type OnDeleteFsNodeError = {
  type: "OnDeleteFsNodeError",
  error: Api.ApiError
}
export const onDeleteFsNodeError = (error: Api.ApiError): OnDeleteFsNodeError => ({
  type: "OnDeleteFsNodeError",
  error
})

export type ShowPreview = { type: "ShowPreview", fsFile?: FsFile }
export const onShowPreview = (fsFile?: FsFile): ShowPreview => ({
  type: "ShowPreview",
  fsFile,
})
