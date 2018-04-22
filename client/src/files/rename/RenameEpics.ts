import { isActionOf } from "typesafe-actions"
import { Epic, combineEpics } from "redux-observable"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { RenameActions } from "files/rename/RenameActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"
import { Observable } from "rxjs/Observable"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const renameEpic: EpicType = (action$, _, dependencies: Dependencies) => {
  return action$
    .filter(isActionOf(RenameActions.rename))
    .mergeMap(({ payload: { fsNode, newName } }) =>
      dependencies.requests.move(fsNode.path, `${fsNode.path.replace(fsNode.name, "")}${newName}`)
        .map(movedfsNode => RenameActions.renameSuccess({ fsNode: movedfsNode }))
        .catch((error: ApiError) => Observable.of(RenameActions.renameError({ error })))
    )
}

export const renameErrorEpic: EpicType = action$ => {
  return action$
    .ofType("RenameError")
    .filter(isActionOf(RenameActions.renameError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const renameEpics = combineEpics(
  renameEpic, renameErrorEpic,
)
