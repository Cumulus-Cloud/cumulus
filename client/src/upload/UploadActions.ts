import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { FsNode, Compression, Cipher } from "models/FsNode"
import { FileToUpload } from "models/FileToUpload"
import * as Api from "services/Api"
import debounce from "utils/debounce"

export type UploadAction =
  OnWantUpload |
  OnAddFiles |
  OnUploadFileSuccess |
  OnUploadFile |
  OnUploadFileError |
  OnProgressUpload |
  SelectCipher |
  SelectCompression

export type OnWantUpload = { type: "OnWantUpload" }
export const onWantUpload = (): OnWantUpload => ({ type: "OnWantUpload" })

export type OnAddFiles = { type: "OnAddFiles", filesToUpload: FileToUpload[] }
export const onAddFiles = (filesToUpload: FileToUpload[]): OnAddFiles => ({ type: "OnAddFiles", filesToUpload })

export type OnUploadFile = { type: "OnUploadFile", fileToUpload: FileToUpload }
export function onUploadFile(path: string, fileToUpload: FileToUpload): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "OnUploadFile", fileToUpload })
    const progress = (e: ProgressEvent) => {
      const progress = Math.round(e.loaded * 100 / e.total)
      dispatch(onProgressUpload(progress, fileToUpload))
    }
    Api.upload(path, fileToUpload.file, debounce(progress, 30))
      .then(fsNode => dispatch(onUploadFileSuccess(fsNode, fileToUpload)))
      .catch(error => dispatch(onUploadFileError(error, fileToUpload)))
  }
}

export type OnUploadFileSuccess = { type: "OnUploadFileSuccess", fsNode: FsNode, fileToUpload: FileToUpload }
export function onUploadFileSuccess(fsNode: FsNode, fileToUpload: FileToUpload): OnUploadFileSuccess {
  return { type: "OnUploadFileSuccess", fsNode, fileToUpload }
}

export type OnUploadFileError = { type: "OnUploadFileError", error: Api.ApiError, fileToUpload: FileToUpload  }
export function onUploadFileError(error: Api.ApiError, fileToUpload: FileToUpload ): OnUploadFileError {
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
