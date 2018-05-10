import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of } from "rxjs"
import { filter, mergeMap, map, catchError } from "rxjs/operators"
import { GlobalState, Dependencies } from "store"
import { Actions } from "actions"
import { RenameActions } from "files/rename/RenameActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const renameEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(RenameActions.rename)),
  mergeMap(({ payload: { fsNode, newName } }) => requests.move(fsNode.path, `${fsNode.path.replace(fsNode.name, "")}${newName}`).pipe(
    map(movedfsNode => RenameActions.renameSuccess({ fsNode: movedfsNode })),
    catchError((error: ApiError) => of(RenameActions.renameError({ error })))
  ))
)

export const renameErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(RenameActions.renameError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const renameEpics = combineEpics(
  renameEpic, renameErrorEpic,
)
