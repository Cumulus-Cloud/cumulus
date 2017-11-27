import { ThunkAction } from "redux-thunk"
import { GlobalState } from "store"
import { FsNode } from "models/FsNode"
import * as Api from "services/Api"
import debounce from "utils/debounce"

export type UploadAction =
  OnWantUpload |
  OnAddFiles |
  OnUploadFileSuccess |
  OnUploadFile |
  OnUploadFileError |
  OnProgressUpload

export type OnWantUpload = { type: "OnWantUpload" }
export const onWantUpload = (): OnWantUpload => ({ type: "OnWantUpload" })

export type OnAddFiles = { type: "OnAddFiles", files: File[] }
export const onAddFiles = (files: File[]): OnAddFiles => ({ type: "OnAddFiles", files })

export type OnUploadFile = { type: "OnUploadFile", file: File }
export function onUploadFile(path: string, file: File): ThunkAction<void, GlobalState, {}> {
  return (dispatch) => {
    dispatch({ type: "OnUploadFile", file })
    const progress = (e: ProgressEvent) => {
      const progress = Math.round(e.loaded * 100 / e.total)
      dispatch(onProgressUpload(progress))
    }
    Api.upload(path, file, debounce(progress, 30))
      .then(fsNode => dispatch(onUploadFileSuccess(fsNode)))
      .catch(error => dispatch(onUploadFileError(error)))
  }
}

export type OnUploadFileSuccess = { type: "OnUploadFileSuccess", fsNode: FsNode }
export function onUploadFileSuccess(fsNode: FsNode): OnUploadFileSuccess {
  return { type: "OnUploadFileSuccess", fsNode }
}

export type OnUploadFileError = { type: "OnUploadFileError", error: Api.ApiError }
export function onUploadFileError(error: Api.ApiError): OnUploadFileError {
  return { type: "OnUploadFileError", error }
}

export type OnProgressUpload = { type: "OnProgressUpload", progress: number }
export function onProgressUpload(progress: number): OnProgressUpload {
  return { type: "OnProgressUpload", progress }
}
