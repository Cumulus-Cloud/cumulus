import { Epic, combineEpics } from "redux-observable"
import { isActionOf } from "typesafe-actions"
import { of } from "rxjs"
import { filter, mergeMap, map, catchError } from "rxjs/operators"
import { GlobalState, Dependencies } from "store"
import { MoveActions } from "files/move/MoveActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const moveEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(MoveActions.move)),
  mergeMap(({ payload: { fsNodeToMove, target } }) => {
    const to = `${target.path === "/" ? "" : target.path}/${fsNodeToMove.name}`
    return requests.move(fsNodeToMove.path, to).pipe(
      map(movedfsNode => MoveActions.moveSuccess(fsNodeToMove, movedfsNode)),
      catchError((error: ApiError) => of(MoveActions.moveError(error)))
    )
  })
)

export const moveErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(MoveActions.moveError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const changeMoveTargetEpic: EpicType = (action$, _, { requests }) => action$.pipe(
  filter(isActionOf(MoveActions.changeMoveTarget)),
  mergeMap(({ payload: { path } }) => requests.fetchDirectory(path).pipe(
    map(MoveActions.changeMoveTargetSuccess),
    catchError((error: ApiError) => of(MoveActions.changeMoveTargetError(error)))
  ))
)

export const changeMoveTargetErrorEpic: EpicType = action$ => action$.pipe(
  filter(isActionOf(MoveActions.changeMoveTargetError)),
  map(({ payload: { error } }) => showApiErrorNotif(error))
)

export const moveEpics = combineEpics(
  moveEpic, moveErrorEpic,
  changeMoveTargetEpic, changeMoveTargetErrorEpic
)
