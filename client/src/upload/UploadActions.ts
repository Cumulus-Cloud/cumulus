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
      console.log("onProgressUpload", e)
      dispatch(onProgressUpload(e.loaded * 100 / e.total))
    }

    Api.upload(path, file, debounce(progress, 500))
      .then(fsNode => dispatch(onUploadFileSuccess(fsNode)))
      .catch(error => dispatch(onUploadFileError(error)))
  }
}

export type OnUploadFileSuccess = { type: "OnUploadFileSuccess", fsNode: FsNode }
export function onUploadFileSuccess(fsNode: FsNode): OnUploadFileSuccess {
  return { type: "OnUploadFileSuccess", fsNode }
}

export type OnUploadFileError = { type: "OnUploadFileError", error: any }
export function onUploadFileError(error: any): OnUploadFileError {
  return { type: "OnUploadFileError", error }
}

export type OnProgressUpload = { type: "OnProgressUpload", progress: number }
export function onProgressUpload(progress: number): OnProgressUpload {
  return { type: "OnProgressUpload", progress }
}
