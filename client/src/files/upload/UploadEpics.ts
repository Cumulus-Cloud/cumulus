import { MiddlewareAPI } from "redux"
import { Observable } from "rxjs/Observable"
import { Observer } from "rxjs/Observer"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { UploadAction, UploadFile, UploadFileError, uploadFileSuccess, uploadFileError, progressUpload } from "files/upload/UploadActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import debounce from "utils/debounce"
import { Actions } from "actions"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const uploadEpic: EpicType = (
  action$: ActionsObservable<UploadFile>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("UploadFile")
    .mergeMap(action => {
      return Observable.create((observer: Observer<UploadAction>) => {
        const progress = (e: ProgressEvent) => {
          const progressed = Math.round(e.loaded * 100 / e.total)
          observer.next(progressUpload(progressed, action.fileToUpload))
        }
        dependencies.requests.upload(action.path, action.fileToUpload, debounce(progress, 30))
          .toPromise()
          .then(fsNode => {
            observer.next(uploadFileSuccess(fsNode, action.fileToUpload))
            observer.complete()
          })
          .catch(error => {
            console.log("uploadEpic catch", error)
            observer.next(uploadFileError(error, action.fileToUpload))
            observer.complete()
          })
      })
    })
}

export const uploadErrorEpic: EpicType = (action$: ActionsObservable<UploadFileError>) => {
  return action$
    .ofType("UploadFileError")
    .map(action => {
      console.log("uploadErrorEpic", action)
      return showApiErrorNotif(action.error)
    })
}

export const uploadEpics = combineEpics(
  uploadEpic, uploadErrorEpic,
)
