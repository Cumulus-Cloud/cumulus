import { Action } from "redux"
// import { FsNode } from "models/FsNode"
import { ApiError } from "services/Api"
import { FsNode } from "models/FsNode";

export type SharedFilesAction =
  FetchSharedFiles |
  FetchSharedFilesSuccess |
  FetchSharedFilesError

export interface FetchSharedFiles extends Action {
  type: "FetchSharedFiles"
}
export function fetchSharedFiles(): FetchSharedFiles {
  return { type: "FetchSharedFiles" }
}

export interface FetchSharedFilesSuccess extends Action {
  type: "FetchSharedFilesSuccess"
  fsNodes: FsNode[]
}
export function fetchSharedFilesSuccess(fsNodes: FsNode[]): FetchSharedFilesSuccess {
  return { type: "FetchSharedFilesSuccess", fsNodes }
}

export interface FetchSharedFilesError extends Action {
  type: "FetchSharedFilesError"
  error: ApiError
}
export function fetchSharedFilesError(error: ApiError): FetchSharedFilesError {
  return { type: "FetchSharedFilesError", error }
}
