import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import * as Api from "services/Api"
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

export type Rename = { type: "Rename" }
export function rename(newName: string, fsNode: FsNode): ThunkAction<void, GlobalState, {}> {
  return (dispatch, getState) => {
    dispatch({ type: "Rename" })
    if (fsNode.name !== newName) {
      Api.rename(fsNode, `${fsNode.path.replace(fsNode.name, "")}${newName}`).then(renamedFsNode => {
        dispatch(renameSuccess(renamedFsNode))
      }).catch(error => {
        dispatch(renameError(error))
      })
    } else {
      dispatch(cancelRename())
    }
  }
}

export type RenameSuccess = { type: "RenameSuccess", fsNode: FsNode }
export const renameSuccess = (fsNode: FsNode): RenameSuccess => ({ type: "RenameSuccess", fsNode })

export type RenameError = { type: "RenameError", error: Api.ApiError }
export const renameError = (error: Api.ApiError): RenameError => ({
  type: "RenameError",
  error
})
