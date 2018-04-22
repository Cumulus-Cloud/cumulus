import { Action } from "redux"
import { ApiError } from "models/ApiError"
import { SharingApiResponse, SharingItem } from "models/Sharing"

export type SharedFilesAction =
  FetchSharedFiles |
  FetchSharedFilesSuccess |
  FetchSharedFilesError |
  DeleteSharedFile |
  DeleteSharedFileSuccess |
  DeleteSharedFileError

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

export interface DeleteSharedFile {
  type: "DeleteSharedFile"
  sharing: SharingItem
}
export function deleteSharedFile(sharing: SharingItem): DeleteSharedFile {
  return { type: "DeleteSharedFile", sharing }
}

export interface DeleteSharedFileSuccess {
  type: "DeleteSharedFileSuccess"
  sharing: SharingItem
}
export function deleteSharedFileSuccess(sharing: SharingItem): DeleteSharedFileSuccess {
  return { type: "DeleteSharedFileSuccess", sharing }
}

export interface DeleteSharedFileError {
  type: "DeleteSharedFileError"
  error: ApiError
}
export function deleteSharedFileError(error: ApiError): DeleteSharedFileError {
  return { type: "DeleteSharedFileError", error }
}
