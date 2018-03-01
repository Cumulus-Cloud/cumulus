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

export type OnCreateNewFolder = { type: "OnCreateNewFolder", currentDirectory: FsNode, newFolderName: string }
export function onCreateNewFolder(currentDirectory: FsNode, newFolderName: string): OnCreateNewFolder {
  return { type: "OnCreateNewFolder", currentDirectory, newFolderName }
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
