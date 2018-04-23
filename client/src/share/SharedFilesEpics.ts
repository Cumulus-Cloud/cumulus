import { isActionOf } from "typesafe-actions"
import { Observable } from "rxjs/Observable"
import { Epic, combineEpics } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { SharedFilesActions } from "share/SharedFilesActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const fetchSharedFilesEpic: EpicType = (
  action$, _, dependencies
) => {
  return action$
    .filter(isActionOf(SharedFilesActions.fetchSharedFiles))
    .mergeMap(() =>
      dependencies.requests.sharings()
        .map(sharingApiResponse => SharedFilesActions.fetchSharedFilesSuccess({ sharingApiResponse }))
        .catch((error: ApiError) => Observable.of(SharedFilesActions.fetchSharedFilesError({ error })))
    )
}

export const fetchSharedFilesErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(SharedFilesActions.fetchSharedFilesError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const deleteSharedFileEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(SharedFilesActions.deleteSharedFile))
    .mergeMap(({ payload: { sharing } }) =>
      dependencies.requests.deleteSharing(sharing.sharing.reference)
        .map(share => SharedFilesActions.deleteSharedFileSuccess({ sharing: share }))
        .catch((error: ApiError) => Observable.of(SharedFilesActions.deleteSharedFileError({ error })))
    )
}

export const deleteSharedFileErrorEpic: EpicType = action$ => {
  return action$
    .ofType("DeleteSharedFileError")
    .filter(isActionOf(SharedFilesActions.deleteSharedFileError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const sharedFilesEpics = combineEpics(
  fetchSharedFilesEpic, fetchSharedFilesErrorEpic,
  deleteSharedFileEpic, deleteSharedFileErrorEpic
)
