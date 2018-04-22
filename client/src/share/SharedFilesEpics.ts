import { MiddlewareAPI } from "redux"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { FetchSharedFiles, FetchSharedFilesError, fetchSharedFilesSuccess, fetchSharedFilesError } from "share/SbaredFilesActions"
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

export const sharedFilesEpics = combineEpics(
  fetchSharedFilesEpic, fetchSharedFilesErrorEpic
)
