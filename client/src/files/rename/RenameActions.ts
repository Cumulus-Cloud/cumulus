import { ApiError } from "services/Api"
import { FsNode } from "models/FsNode"

export type RenameAction =
  WantRename |
  ChangeName |
  CancelRename |
  Rename |
  RenameSuccess |
  RenameError

export type WantRename = { type: "WantRename", fsNode: FsNode }
export const wantRename = (fsNode: FsNode): WantRename => ({ type: "WantRename", fsNode })

export type CancelRename = { type: "CancelRename" }
export const cancelRename = (): CancelRename => ({ type: "CancelRename" })

export type ChangeName = { type: "ChangeName", name: string }
export const changeName = (name: string): ChangeName => ({ type: "ChangeName", name })

export type Rename = { type: "Rename", newName: string, fsNode: FsNode }
export function rename(newName: string, fsNode: FsNode): Rename {
  return { type: "Rename", newName, fsNode }
}

export type RenameSuccess = { type: "RenameSuccess", fsNode: FsNode }
export const renameSuccess = (fsNode: FsNode): RenameSuccess => ({ type: "RenameSuccess", fsNode })

export type RenameError = { type: "RenameError", error: ApiError }
export const renameError = (error: ApiError): RenameError => ({
  type: "RenameError",
  error
})
