import { Action } from "redux"
import { FsNode } from "models/FsNode"
import { ApiError } from "services/Api"

export type NewFolderAction =
  NewFolderNameChange |
  WantCreateNewFolder |
  CreateNewFolder |
  CreateNewFolderError |
  CreateNewFolderSuccess

export interface NewFolderNameChange extends Action {
  type: "NewFolderNameChange"
  newFolderName: string
}
export function newFolderNameChange(newFolderName: string): NewFolderNameChange {
  return { type: "NewFolderNameChange", newFolderName }
}

export interface WantCreateNewFolder extends Action {
  type: "WantCreateNewFolder"
}
export function wantCreateNewFolder(): WantCreateNewFolder {
  return { type: "WantCreateNewFolder" }
}

export interface CreateNewFolder extends Action {
  type: "CreateNewFolder"
  currentDirectory: FsNode
  newFolderName: string
}
export function createNewFolder(currentDirectory: FsNode, newFolderName: string): CreateNewFolder {
  return { type: "CreateNewFolder", currentDirectory, newFolderName }
}

export interface CreateNewFolderSuccess extends Action {
  type: "CreateNewFolderSuccess"
  newFolder: FsNode
}
export function createNewFolderSuccess(newFolder: FsNode): CreateNewFolderSuccess {
  return { type: "CreateNewFolderSuccess", newFolder }
}

export interface CreateNewFolderError extends Action {
  type: "CreateNewFolderError"
  error: ApiError
}
export function createNewFolderError(error: ApiError): CreateNewFolderError {
  return { type: "CreateNewFolderError", error }
}
