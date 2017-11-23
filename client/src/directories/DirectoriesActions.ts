import { AnyAction } from "redux"
import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as Api from "services/Api"
import { OnCreateNewFolderSuccess } from "newFolder/NewFolderActions"

export type DirectoriesAction =
  OnFetchDirectory |
  OnFetchDirectorySuccess |
  OnFetchDirectoryError |
  OnCreateNewFolderSuccess |
  OnDeleteFsNode |
  OnDeleteFsNodeSuccess |
  OnDeleteFsNodeError

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
  error: any
}
export const onFetchDirectoryError = (error: any): OnFetchDirectoryError => ({
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

