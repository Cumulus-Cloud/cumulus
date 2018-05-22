import { isActionOf } from "typesafe-actions"
import { Observable, Observer } from "rxjs"
import { filter, mergeMap } from "rxjs/operators"
import { Epic, combineEpics } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { UploadActions } from "files/upload/UploadActions"
import { debounce } from "ts-debounce"
import { Actions } from "actions"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const uploadEpic: EpicType = (action$, _, dependencies) => action$.pipe(
  filter(isActionOf(UploadActions.uploadFile)),
  mergeMap(({ payload: { path, fileToUpload } }) => {
    return Observable.create((observer: Observer<Actions>) => {
      const progress = (e: ProgressEvent) => {
        const progressed = Math.round(e.loaded * 100 / e.total)
        observer.next(UploadActions.progressUpload(progressed, fileToUpload))
      }
      dependencies.requests.upload(path, fileToUpload, debounce(progress, 30))
        .toPromise()
        .then(fsNode => {
          observer.next(UploadActions.uploadFileSuccess(fsNode, fileToUpload))
          observer.complete()
        })
        .catch(error => {
          observer.next(UploadActions.uploadFileError(error, fileToUpload))
          observer.complete()
        })
    })
  })
)

export const uploadEpics = combineEpics(
  uploadEpic
)
