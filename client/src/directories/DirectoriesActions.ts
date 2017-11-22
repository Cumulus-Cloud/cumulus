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
  OnCreateNewFolderSuccess

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
