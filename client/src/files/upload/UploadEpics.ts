import { MiddlewareAPI } from "redux"
import { Observable } from "rxjs/Observable"
import { Observer } from "rxjs/Observer"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { UploadAction, UploadFile, uploadFileSuccess, uploadFileError, progressUpload } from "files/upload/UploadActions"
import { debounce } from "ts-debounce"
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
            observer.next(uploadFileError(error, action.fileToUpload))
            observer.complete()
          })
      })
    })
}

export const uploadEpics = combineEpics(
  uploadEpic
)
