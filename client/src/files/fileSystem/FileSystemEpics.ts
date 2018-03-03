import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
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
  DeleteFsNodeError
} from "files/fileSystem/FileSystemActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const fetchDirectoryEpic: Epic<any, GlobalState> = (action$: ActionsObservable<FetchDirectory>) => {
  return action$
    .ofType("FetchDirectory")
    .mergeMap(action =>
      Api.fetchDirectory(action.path)
        .then(fetchDirectorySuccess)
        .catch(fetchDirectoryError)
    )
}

export const fetchDirectoryErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<FetchDirectoryError>) => {
  return action$
    .ofType("FetchDirectoryError")
    .map(action => showApiErrorNotif(action.error))
}

export const onDeleteFsNodeEpic: Epic<any, GlobalState> = (action$: ActionsObservable<DeleteFsNode>) => {
  return action$
    .ofType("DeleteFsNode")
    .mergeMap(action =>
      Api.deleteFsNode(action.fsNode)
        .then(() => deleteFsNodeSuccess(action.fsNode))
        .catch(deleteFsNodeError)
    )
}

export const onDeleteFsNodeErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<DeleteFsNodeError>) => {
  return action$
    .ofType("DeleteFsNodeError")
    .map(action => showApiErrorNotif(action.error))
}

export const sharingEpic: Epic<any, GlobalState> = (action$: ActionsObservable<Sharing>) => {
  return action$
    .ofType("Sharing")
    .mergeMap(action =>
      Api.share(action.fsNode)
        .then(share => onSharingSuccess(share, action.fsNode))
        .catch(onSharingError)
    )
}

export const sharingErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<SharingError>) => {
  return action$
    .ofType("SharingError")
    .map(action => showApiErrorNotif(action.error))
}

export const fileSystemEpics = combineEpics(
  fetchDirectoryEpic, fetchDirectoryErrorEpic,
  onDeleteFsNodeEpic, onDeleteFsNodeErrorEpic,
  sharingEpic, sharingErrorEpic,
)
