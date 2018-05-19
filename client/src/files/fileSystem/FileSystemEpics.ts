import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of } from "rxjs"
import { filter, switchMap, mergeMap, map, catchError } from "rxjs/operators"
import { GlobalState, Dependencies } from "store"
import { FileSystemActions } from "files/fileSystem/FileSystemActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const fetchDirectoryEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(FileSystemActions.fetchDirectory)),
  switchMap(({ payload: { path } }) => requests.fetchDirectory(path).pipe(
    map(FileSystemActions.fetchDirectorySuccess),
    catchError((error: ApiError) => of(FileSystemActions.fetchDirectoryError(error)))
  ))
)

export const fetchDirectoryErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(FileSystemActions.fetchDirectoryError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const onDeleteFsNodeEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(FileSystemActions.deleteFsNode)),
  mergeMap(({ payload: { fsNode } }) => requests.deleteFsNode(fsNode).pipe(
    map(() => FileSystemActions.deleteFsNodeSuccess(fsNode)),
    catchError((error: ApiError) => of(FileSystemActions.deleteFsNodeError(error)))
  ))
)

export const onDeleteFsNodeErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(FileSystemActions.deleteFsNodeError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const sharingEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(FileSystemActions.sharing)),
  mergeMap(({ payload: { fsNode } }) => requests.share(fsNode).pipe(
    map(share => FileSystemActions.sharingSuccess(share, fsNode)),
    catchError((error: ApiError) => of(FileSystemActions.sharingError(error)))
  ))
)

export const sharingErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(FileSystemActions.sharingError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const fileSystemEpics = combineEpics(
  fetchDirectoryEpic, fetchDirectoryErrorEpic,
  onDeleteFsNodeEpic, onDeleteFsNodeErrorEpic,
  sharingEpic, sharingErrorEpic,
)
