import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { Rename, RenameError, renameSuccess, renameError } from "rename/RenameActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

export const renameEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("Rename")
    .mergeMap((action: Rename) =>
      Api.rename(action.fsNode, `${action.fsNode.path.replace(action.fsNode.name, "")}${action.newName}`)
        .then(renameSuccess)
        .catch(renameError)
    )

export const renameErrorEpic: Epic<any, GlobalState> = (action$) => action$.ofType("RenameError")
    .map((action: RenameError) => showErrorNotif(action.error.message))

export const renameEpics = combineEpics(
  renameEpic, renameErrorEpic,
)
