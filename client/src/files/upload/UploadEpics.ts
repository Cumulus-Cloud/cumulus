import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { UploadAction, UploadFile, UploadFileError, uploadFileSuccess, uploadFileError, progressUpload } from "files/upload/UploadActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Observable } from "rxjs/Observable"
import { Observer } from "rxjs/Observer"
import debounce from "utils/debounce"

export const uploadEpic: Epic<UploadAction, GlobalState> = (action$: ActionsObservable<UploadFile>) => action$.ofType("UploadFile")
    .mergeMap(action => {
      return Observable.create((observer: Observer<UploadAction>) => {
        const progress = (e: ProgressEvent) => {
          const progressed = Math.round(e.loaded * 100 / e.total)
          observer.next(progressUpload(progressed, action.fileToUpload))
        }
        Api.upload(action.path, action.fileToUpload, debounce(progress, 30))
          .then(fsNode => {
            observer.next(uploadFileSuccess(fsNode, action.fileToUpload))
            observer.complete()
          })
          .catch(error => {
            observer.next(uploadFileError(error, action.fileToUpload))
            observer.complete()
          })
        })
    })

export const uploadErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<UploadFileError>) => {
  return action$
    .ofType("UploadFileError")
    .map(action => showApiErrorNotif(action.error))
}

export const uploadEpics = combineEpics(
  uploadEpic, uploadErrorEpic,
)
