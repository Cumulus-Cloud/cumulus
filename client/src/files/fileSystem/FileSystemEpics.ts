import { Epic, combineEpics } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { isActionOf } from "typesafe-actions"
import { FileSystemActions } from "files/fileSystem/FileSystemActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Observable } from "rxjs/Observable"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const fetchDirectoryEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(FileSystemActions.fetchDirectory))
    .concatMap(({ payload: { path } }) =>
      dependencies.requests.fetchDirectory(path)
        .map(directory => FileSystemActions.fetchDirectorySuccess({ directory }))
        .catch((error: ApiError) => Observable.of(FileSystemActions.fetchDirectoryError({ error })))
    )
}

export const fetchDirectoryErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(FileSystemActions.fetchDirectoryError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const onDeleteFsNodeEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(FileSystemActions.deleteFsNode))
    .mergeMap(({ payload: { fsNode } }) =>
      dependencies.requests.deleteFsNode(fsNode)
        .map(() => FileSystemActions.deleteFsNodeSuccess({ fsNode }))
        .catch((error: ApiError) => Observable.of(FileSystemActions.deleteFsNodeError({ error })))
    )
}

export const onDeleteFsNodeErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(FileSystemActions.deleteFsNodeError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const sharingEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(FileSystemActions.sharing))
    .mergeMap(({ payload: { fsNode } }) =>
      dependencies.requests.share(fsNode)
        .map(share => FileSystemActions.sharingSuccess({ share, fsNode }))
        .catch((error: ApiError) => Observable.of(FileSystemActions.sharingError({ error })))
    )
}

export const sharingErrorEpic: EpicType = action$ => {
  return action$
    .ofType("SharingError")
    .filter(isActionOf(FileSystemActions.sharingError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const fileSystemEpics = combineEpics(
  fetchDirectoryEpic, fetchDirectoryErrorEpic,
  onDeleteFsNodeEpic, onDeleteFsNodeErrorEpic,
  sharingEpic, sharingErrorEpic,
)
