import { AnyAction } from "redux"
import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { FsNode, FsFile } from "models/FsNode"
import { Share } from "models/Share"
import * as Api from "services/Api"
import { OnCreateNewFolderSuccess } from "newFolder/NewFolderActions"
import { OnUploadFileSuccess } from "upload/UploadActions"

export type FileSystemAction =
  OnFetchDirectory |
  OnFetchDirectorySuccess |
  OnFetchDirectoryError |
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

export type SelectFsNode = { type: "SelectFsNode", fsNode: FsNode }
export const onSelectFsNode = (fsNode: FsNode): SelectFsNode => ({ type: "SelectFsNode", fsNode })

export type DeselectFsNode = { type: "DeselectFsNode", fsNode: FsNode }
export const onDeselectFsNode = (fsNode: FsNode): DeselectFsNode => ({ type: "DeselectFsNode", fsNode })

export type SharingError = { type: "SharingError", error: Api.ApiError }
export const onSharingError = (error: Api.ApiError): SharingError => ({ type: "SharingError", error })

export type CloseShare = { type: "CloseShare" }
export const onCloseShare = (): CloseShare => ({ type: "CloseShare" })

export interface OnFetchDirectory extends AnyAction {
  type: "OnFetchDirectory"
  path: string
}
export function onFetchDirectory(path: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "OnFetchDirectory", path })
    Api.fetchDirectory(path)
      .then(directory => dispatch(onFetchDirectorySuccess(directory)))
      .catch(error => dispatch(onFetchDirectoryError(error)))
  }
}

export type OnFetchDirectorySuccess = {
  type: "OnFetchDirectorySuccess"
  directory: FsNode
}
export const onFetchDirectorySuccess = (directory: FsNode): OnFetchDirectorySuccess => ({
  type: "OnFetchDirectorySuccess",
  directory
})

export type OnFetchDirectoryError = {
  type: "OnFetchDirectoryError"
  error: Api.ApiError
}
export const onFetchDirectoryError = (error: Api.ApiError): OnFetchDirectoryError => ({
  type: "OnFetchDirectoryError",
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
