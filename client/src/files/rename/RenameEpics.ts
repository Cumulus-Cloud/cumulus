import { MiddlewareAPI } from "redux"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { Rename, RenameError, renameSuccess, renameError } from "files/rename/RenameActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"
import { Observable } from "rxjs/Observable"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const renameEpic: EpicType = (
  action$: ActionsObservable<Rename>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("Rename")
    .mergeMap(action =>
      dependencies.requests.move(action.fsNode.path, `${action.fsNode.path.replace(action.fsNode.name, "")}${action.newName}`)
        .map(renameSuccess)
        .catch((error: ApiError) => Observable.of(renameError(error)))
    )
}

export const renameErrorEpic: EpicType = (action$: ActionsObservable<RenameError>) => {
  return action$.ofType("RenameError")
    .map(action => showApiErrorNotif(action.error))
}

export const renameEpics = combineEpics(
  renameEpic, renameErrorEpic,
)
