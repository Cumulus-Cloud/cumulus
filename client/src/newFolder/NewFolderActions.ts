import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as Api from "services/Api"

export type NewFolderAction =
  OnNewFolderNameChange |
  OnWantCreateNewFolder |
  OnCreateNewFolder |
  OnCreateNewFolderError |
  OnCreateNewFolderSuccess

export type OnNewFolderNameChange = { type: "OnNewFolderNameChange", newFolderName: string }
export const onNewFolderNameChange = (newFolderName: string): OnNewFolderNameChange => ({
  type: "OnNewFolderNameChange",
  newFolderName
})

export type OnWantCreateNewFolder = { type: "OnWantCreateNewFolder" }
export const onWantCreateNewFolder = (): OnWantCreateNewFolder => ({ type: "OnWantCreateNewFolder" })

export type OnCreateNewFolder = { type: "OnCreateNewFolder", newFolderName: string }
export function onCreateNewFolder(currentDirectory: FsNode, newFolderName: string): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "OnCreateNewFolder", newFolderName })
    Api.createFnNode(`${currentDirectory.path}/${newFolderName}`, "DIRECTORY").then(fsNode => {
      dispatch(onCreateNewFolderSuccess(fsNode))
    }).catch(error => {
      dispatch(onCreateNewFolderError(error))
    })
  }
}

export type OnCreateNewFolderSuccess = { type: "OnCreateNewFolderSuccess", newFolder: FsNode }
export const onCreateNewFolderSuccess = (newFolder: FsNode): OnCreateNewFolderSuccess => ({
  type: "OnCreateNewFolderSuccess",
  newFolder
})

export type OnCreateNewFolderError = { type: "OnCreateNewFolderError", error: Api.ApiError }
export const onCreateNewFolderError = (error: Api.ApiError): OnCreateNewFolderError => ({
  type: "OnCreateNewFolderError",
  error
})
