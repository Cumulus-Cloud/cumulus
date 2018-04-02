import { Action } from "redux"
import { FsNode, Compression, Cipher } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { ApiError } from "services/Api"
import { UploadModalStatus } from "models/UploadModalStatus"

export type UploadAction =
  UploaderModalStatus |
  AddFiles |
  UploadFileSuccess |
  UploadFile |
  UploadFileError |
  ProgressUpload |
  RemoveFileToUpload |
  SelectCipher |
  SelectCompression

export interface UploaderModalStatus extends Action {
  type: "UploaderModalStatus"
  status: UploadModalStatus
}
export function uploaderModalStatus(status: UploadModalStatus): UploaderModalStatus {
  return { type: "UploaderModalStatus", status }
}

export interface AddFiles extends Action {
  type: "AddFiles"
  filesToUpload: FileToUpload[]
}
export const addFiles = (filesToUpload: FileToUpload[]): AddFiles => ({ type: "AddFiles", filesToUpload })

export interface RemoveFileToUpload extends Action {
  type: "RemoveFileToUpload"
  fileToUpload: FileToUpload
}
export function removeFileToUpload(fileToUpload: FileToUpload): RemoveFileToUpload {
  return { type: "RemoveFileToUpload", fileToUpload }
}

export interface UploadFile extends Action {
  type: "UploadFile"
  path: string
  fileToUpload: FileToUpload
}
export function uploadFile(path: string, fileToUpload: FileToUpload): UploadFile {
  return { type: "UploadFile", path, fileToUpload }
}

export interface UploadFileSuccess extends Action {
  type: "UploadFileSuccess"
  fsNode: FsNode
  fileToUpload: FileToUpload
}
export function uploadFileSuccess(fsNode: FsNode, fileToUpload: FileToUpload): UploadFileSuccess {
  return { type: "UploadFileSuccess", fsNode, fileToUpload }
}

export interface UploadFileError extends Action {
  type: "UploadFileError"
  error: ApiError
  fileToUpload: FileToUpload
}
export function uploadFileError(error: ApiError, fileToUpload: FileToUpload): UploadFileError {
  return { type: "UploadFileError", error, fileToUpload }
}

export interface ProgressUpload extends Action {
  type: "ProgressUpload"
  progress: number
  fileToUpload: FileToUpload
}
export function progressUpload(progress: number, fileToUpload: FileToUpload): ProgressUpload {
  return { type: "ProgressUpload", progress, fileToUpload }
}

export interface SelectCipher extends Action {
  type: "SelectCipher"
  fileToUpload: FileToUpload
  cipher?: Cipher
}
export function onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): SelectCipher {
  return { type: "SelectCipher", fileToUpload, cipher }
}

export interface SelectCompression extends Action {
  type: "SelectCompression"
  fileToUpload: FileToUpload
  compression?: Compression
}
export function onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): SelectCompression {
  return { type: "SelectCompression", fileToUpload, compression }
}
