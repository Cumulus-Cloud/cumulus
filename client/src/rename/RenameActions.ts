// import { ThunkAction } from "redux-thunk"
// import { GlobalState } from "store"
// import * as Api from "services/Api"
import { FsNode } from "models/FsNode"

export type RenameAction = WantRename | ChangeName | CancelRename

export type WantRename = { type: "WantRename", fsNode: FsNode }
export const wantRename = (fsNode: FsNode): WantRename => ({ type: "WantRename", fsNode })

export type CancelRename = { type: "CancelRename" }
export const cancelRename = (): CancelRename => ({ type: "CancelRename" })

export type ChangeName = { type: "ChangeName", name: string }
export const changeName = (name: string): ChangeName => ({ type: "ChangeName", name })
