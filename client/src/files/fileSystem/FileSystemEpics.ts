import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { MiddlewareAPI } from "redux"
import { GlobalState, Dependencies } from "store"
import {
  FetchDirectory,
  fetchDirectorySuccess,
  fetchDirectoryError,
  FetchDirectoryError,
  DeleteFsNode,
  deleteFsNodeSuccess,
  deleteFsNodeError,
  Sharing,
  onSharingSuccess,
  onSharingError,
  SharingError,
  DeleteFsNodeError,
} from "files/fileSystem/FileSystemActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Observable } from "rxjs/Observable"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

export const fetchDirectoryEpic: Epic<Actions, GlobalState, Dependencies> = (
  action$: ActionsObservable<FetchDirectory>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$
    .ofType("FetchDirectory")
    .concatMap(({ path }) =>
      dependencies.requests.fetchDirectory(path)
        .map(fetchDirectorySuccess)
        .catch((error: ApiError) => Observable.of(fetchDirectoryError(error)))
    )
}

export const fetchDirectoryErrorEpic: Epic<Actions, GlobalState> = (action$: ActionsObservable<FetchDirectoryError>) => {
  return action$
    .ofType("FetchDirectoryError")
    .map(action => showApiErrorNotif(action.error))
}

export const onDeleteFsNodeEpic: Epic<Actions, GlobalState> = (
  action$: ActionsObservable<DeleteFsNode>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$
    .ofType("DeleteFsNode")
    .mergeMap(({ fsNode }) =>
      dependencies.requests.deleteFsNode(fsNode)
        .map(() => deleteFsNodeSuccess(fsNode))
        .catch((error: ApiError) => Observable.of(deleteFsNodeError(error)))
    )
}

export const onDeleteFsNodeErrorEpic: Epic<Actions, GlobalState> = (action$: ActionsObservable<DeleteFsNodeError>) => {
  return action$
    .ofType("DeleteFsNodeError")
    .map(action => showApiErrorNotif(action.error))
}

export const sharingEpic: Epic<Actions, GlobalState> = (
  action$: ActionsObservable<Sharing>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$
    .ofType("Sharing")
    .mergeMap(({ fsNode }) =>
      dependencies.requests.share(fsNode)
        .map(share => onSharingSuccess(share, fsNode))
        .catch((error: ApiError) => Observable.of(onSharingError(error)))
    )
}

export const sharingErrorEpic: Epic<Actions, GlobalState> = (action$: ActionsObservable<SharingError>) => {
  return action$
    .ofType("SharingError")
    .map(action => showApiErrorNotif(action.error))
}

export const fileSystemEpics = combineEpics(
  fetchDirectoryEpic, fetchDirectoryErrorEpic,
  onDeleteFsNodeEpic, onDeleteFsNodeErrorEpic,
  sharingEpic, sharingErrorEpic,
)
