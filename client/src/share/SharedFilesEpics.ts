import { MiddlewareAPI } from "redux"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import {
  FetchSharedFiles, FetchSharedFilesError, fetchSharedFilesSuccess, fetchSharedFilesError,
  DeleteSharedFile, deleteSharedFileSuccess, deleteSharedFileError, DeleteSharedFileError
} from "share/SharedFilesActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const fetchSharedFilesEpic: EpicType = (
  action$: ActionsObservable<FetchSharedFiles>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$
    .ofType("FetchSharedFiles")
    .mergeMap(action =>
      dependencies.requests.sharings()
        .map(fetchSharedFilesSuccess)
        .catch((error: ApiError) => Observable.of(fetchSharedFilesError(error)))
    )
}

export const fetchSharedFilesErrorEpic: EpicType = (action$: ActionsObservable<FetchSharedFilesError>) => {
  return action$
    .ofType("FetchSharedFilesError")
    .map(action => showApiErrorNotif(action.error))
}

export const deleteSharedFileEpic: EpicType = (
  action$: ActionsObservable<DeleteSharedFile>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$
    .ofType("DeleteSharedFile")
    .mergeMap(action =>
      dependencies.requests.deleteSharing(action.sharing.sharing.reference)
        .map(deleteSharedFileSuccess)
        .catch((error: ApiError) => Observable.of(deleteSharedFileError(error)))
    )
}

export const deleteSharedFileErrorEpic: EpicType = (action$: ActionsObservable<DeleteSharedFileError>) => {
  return action$
    .ofType("DeleteSharedFileError")
    .map(action => showApiErrorNotif(action.error))
}

export const sharedFilesEpics = combineEpics(
  fetchSharedFilesEpic, fetchSharedFilesErrorEpic,
  deleteSharedFileEpic, deleteSharedFileErrorEpic
)
