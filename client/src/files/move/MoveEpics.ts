import { isActionOf } from "typesafe-actions"
import { Epic, combineEpics } from "redux-observable"
import { Observable } from "rxjs/Observable"
import { GlobalState, Dependencies } from "store"
import { MoveActions } from "files/move/MoveActions"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const moveEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(MoveActions.move))
    .mergeMap(({ payload: { fsNodeToMove, target } }) => {
      const to = `${target.path === "/" ? "" : target.path}/${fsNodeToMove.name}`
      return dependencies.requests.move(fsNodeToMove.path, to)
        .map(movedfsNode => MoveActions.moveSuccess({ fsNodeToMove, movedfsNode }))
        .catch((error: ApiError) => Observable.of(MoveActions.moveError({ error })))
    })
}

export const moveErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(MoveActions.moveError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const changeMoveTargetEpic: EpicType = (action$, _, dependencies) => {
  return action$
    .filter(isActionOf(MoveActions.changeMoveTarget))
    .mergeMap(({ payload: { path } }) =>
      dependencies.requests.fetchDirectory(path)
        .map(target => MoveActions.changeMoveTargetSuccess({ target }))
        .catch((error: ApiError) => Observable.of(MoveActions.changeMoveTargetError({ error })))
    )
}

export const changeMoveTargetErrorEpic: EpicType = action$ => {
  return action$
    .filter(isActionOf(MoveActions.changeMoveTargetError))
    .map(({ payload: { error } }) => showApiErrorNotif(error))
}

export const moveEpics = combineEpics(
  moveEpic, moveErrorEpic,
  changeMoveTargetEpic, changeMoveTargetErrorEpic
)
