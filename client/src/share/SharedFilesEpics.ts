import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { SharedFilesAction, FetchSharedFiles, FetchSharedFilesError, fetchSharedFilesSuccess, fetchSharedFilesError } from "share/SbaredFilesActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const fetchSharedFilesEpic: Epic<SharedFilesAction, GlobalState> = (action$: ActionsObservable<FetchSharedFiles>) => {
  return action$
    .ofType("FetchSharedFiles")
    .mergeMap(action =>
      Api.fetchSharedFiles()
        .then(fetchSharedFilesSuccess)
        .catch(fetchSharedFilesError)
    )
}

// tslint:disable-next-line:no-any
export const fetchSharedFilesErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<FetchSharedFilesError>) => {
  return action$
    .ofType("FetchSharedFilesError")
    .map(action => showApiErrorNotif(action.error))
}

export const sharedFilesEpics = combineEpics(
  fetchSharedFilesEpic, fetchSharedFilesErrorEpic
)
