import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import * as FileSystemActions from "files/fileSystem/FileSystemActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

// tslint:disable-next-line:no-any
export const fetchDirectoryEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("FetchDirectory")
    .mergeMap((action: FileSystemActions.FetchDirectory) =>
      Api.fetchDirectory(action.path)
        .then(FileSystemActions.fetchDirectorySuccess)
        .catch(FileSystemActions.fetchDirectoryError)
    )

// tslint:disable-next-line:no-any
export const fetchDirectoryErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("FetchDirectoryError")
    .map((action: FileSystemActions.FetchDirectoryError) => showApiErrorNotif(action.error))

// tslint:disable-next-line:no-any
export const onDeleteFsNodeEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("OnDeleteFsNode")
    .mergeMap((action: FileSystemActions.OnDeleteFsNode) =>
    Api.deleteFsNode(action.fsNode)
        .then(() => FileSystemActions.onDeleteFsNodeSuccess(action.fsNode))
        .catch(FileSystemActions.onDeleteFsNodeError)
    )

// tslint:disable-next-line:no-any
export const onDeleteFsNodeErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("OnDeleteFsNodeError")
    .map((action: FileSystemActions.OnDeleteFsNodeError) => showApiErrorNotif(action.error))

// tslint:disable-next-line:no-any
export const sharingEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("Sharing")
    .mergeMap((action: FileSystemActions.Sharing) =>
      Api.share(action.fsNode)
        .then(share => FileSystemActions.onSharingSuccess(share, action.fsNode))
        .catch(FileSystemActions.onSharingError)
    )

// tslint:disable-next-line:no-any
export const sharingErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("SharingError")
    .map((action: FileSystemActions.SharingError) => showApiErrorNotif(action.error))

export const fileSystemEpics = combineEpics(
  fetchDirectoryEpic, fetchDirectoryErrorEpic,
  onDeleteFsNodeEpic, onDeleteFsNodeErrorEpic,
  sharingEpic, sharingErrorEpic,
)
