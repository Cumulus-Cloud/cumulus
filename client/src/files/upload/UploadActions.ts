import { FsNode, Compression, Cipher } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import { ApiError } from "services/Api"

export type UploadAction =
  OnWantUpload |
  OnAddFiles |
  OnUploadFileSuccess |
  OnUploadFile |
  OnUploadFileError |
  OnProgressUpload |
  RemoveFileToUpload |
  SelectCipher |
  SelectCompression

export type OnWantUpload = { type: "OnWantUpload" }
export const onWantUpload = (): OnWantUpload => ({ type: "OnWantUpload" })

export type OnAddFiles = { type: "OnAddFiles", filesToUpload: FileToUpload[] }
export const onAddFiles = (filesToUpload: FileToUpload[]): OnAddFiles => ({ type: "OnAddFiles", filesToUpload })

export type RemoveFileToUpload = { type: "RemoveFileToUpload", fileToUpload: FileToUpload }
export const onRemoveFileToUpload = (fileToUpload: FileToUpload): RemoveFileToUpload => ({ type: "RemoveFileToUpload", fileToUpload })

export type OnUploadFile = { type: "OnUploadFile", path: string, fileToUpload: FileToUpload }
export function onUploadFile(path: string, fileToUpload: FileToUpload): OnUploadFile {
  return { type: "OnUploadFile", path, fileToUpload }
}

export type OnUploadFileSuccess = { type: "OnUploadFileSuccess", fsNode: FsNode, fileToUpload: FileToUpload }
export function onUploadFileSuccess(fsNode: FsNode, fileToUpload: FileToUpload): OnUploadFileSuccess {
  return { type: "OnUploadFileSuccess", fsNode, fileToUpload }
}

export type OnUploadFileError = { type: "OnUploadFileError", error: ApiError, fileToUpload: FileToUpload  }
export function onUploadFileError(error: ApiError, fileToUpload: FileToUpload): OnUploadFileError {
  return { type: "OnUploadFileError", error, fileToUpload }
}

export type OnProgressUpload = { type: "OnProgressUpload", progress: number, fileToUpload: FileToUpload }
export function onProgressUpload(progress: number, fileToUpload: FileToUpload): OnProgressUpload {
  return { type: "OnProgressUpload", progress, fileToUpload }
}

export type SelectCipher = { type: "SelectCipher", fileToUpload: FileToUpload, cipher?: Cipher }
export function onSelectCipher(fileToUpload: FileToUpload, cipher?: Cipher): SelectCipher {
  return { type: "SelectCipher", fileToUpload, cipher }
}

export type SelectCompression = { type: "SelectCompression", fileToUpload: FileToUpload, compression?: Compression }
export function onSelectCompression(fileToUpload: FileToUpload, compression?: Compression): SelectCompression {
  return { type: "SelectCompression", fileToUpload, compression }
}
