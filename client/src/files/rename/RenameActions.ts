import { Action } from "redux"
import { FsNode } from "models/FsNode"
import { ApiError } from "models/ApiError"

export type RenameAction =
  WantRename |
  ChangeName |
  CancelRename |
  Rename |
  RenameSuccess |
  RenameError

export interface WantRename extends Action {
  type: "WantRename"
  fsNode: FsNode
}
export function wantRename(fsNode: FsNode): WantRename {
  return { type: "WantRename", fsNode }
}

export interface CancelRename extends Action {
  type: "CancelRename"
}
export function cancelRename(): CancelRename {
  return { type: "CancelRename" }
}

export interface ChangeName extends Action {
  type: "ChangeName"
  name: string
}
export function changeName(name: string): ChangeName {
  return { type: "ChangeName", name }
}

export interface Rename extends Action {
  type: "Rename"
  newName: string
  fsNode: FsNode
}
export function rename(newName: string, fsNode: FsNode): Rename {
  return { type: "Rename", newName, fsNode }
}

export interface RenameSuccess extends Action {
  type: "RenameSuccess"
  fsNode: FsNode
}
export function renameSuccess(fsNode: FsNode): RenameSuccess {
  return { type: "RenameSuccess", fsNode }
}

export interface RenameError extends Action {
  type: "RenameError"
  error: ApiError
}
export function renameError(error: ApiError): RenameError {
  return { type: "RenameError", error }
}
