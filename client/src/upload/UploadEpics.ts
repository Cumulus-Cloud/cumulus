import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { UploadAction, OnUploadFile, OnUploadFileError, onUploadFileSuccess, onUploadFileError, onProgressUpload } from "upload/UploadActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Observable } from "rxjs/Observable"
import { Observer } from "rxjs/Observer"
import debounce from "utils/debounce"

export const uploadEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("OnUploadFile")
    .mergeMap((action: OnUploadFile) => {
      return Observable.create((observer: Observer<UploadAction>) => {
        const progress = (e: ProgressEvent) => {
          const progressed = Math.round(e.loaded * 100 / e.total)
          observer.next(onProgressUpload(progressed, action.fileToUpload))
        }
        Api.upload(action.path, action.fileToUpload, debounce(progress, 30))
          .then(fsNode => {
            observer.next(onUploadFileSuccess(fsNode, action.fileToUpload))
            observer.complete()
          })
          .catch(error => {
            observer.next(onUploadFileError(error, action.fileToUpload))
            observer.complete()
          })
        })
    })

export const uploadErrorEpic: Epic<any, GlobalState> = (action$) => action$.ofType("OnUploadFileError")
    .map((action: OnUploadFileError) => showApiErrorNotif(action.error))

export const uploadEpics = combineEpics(
  uploadEpic, uploadErrorEpic,
)
