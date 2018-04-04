import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { Rename, RenameError, renameSuccess, renameError, RenameAction } from "files/rename/RenameActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"

export const renameEpic: Epic<RenameAction, GlobalState> = (action$: ActionsObservable<Rename>) => action$.ofType("Rename")
    .mergeMap(action =>
      Api.move(action.fsNode.path, `${action.fsNode.path.replace(action.fsNode.name, "")}${action.newName}`)
        .then(renameSuccess)
        .catch(renameError)
    )

export const renameErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<RenameError>) => action$.ofType("RenameError")
    .map(action => showApiErrorNotif(action.error))

export const renameEpics = combineEpics(
  renameEpic, renameErrorEpic,
)
