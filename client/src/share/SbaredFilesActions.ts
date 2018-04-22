import { Action } from "redux"
import { ApiError } from "models/ApiError"
import { SharingApiResponse } from "models/Sharing"

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
  sharingApiResponse: SharingApiResponse
}
export function fetchSharedFilesSuccess(sharingApiResponse: SharingApiResponse): FetchSharedFilesSuccess {
  return { type: "FetchSharedFilesSuccess", sharingApiResponse }
}

export interface FetchSharedFilesError extends Action {
  type: "FetchSharedFilesError"
  error: ApiError
}
export function fetchSharedFilesError(error: ApiError): FetchSharedFilesError {
  return { type: "FetchSharedFilesError", error }
}
