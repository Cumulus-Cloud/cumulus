import { MiddlewareAPI } from "redux"
import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { Observable } from "rxjs/Observable"
import { GlobalState, Dependencies } from "store"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import {
  Move, MoveError, ChangeMoveTarget, moveSuccess, moveError, changeMoveTargetSuccess, changeMoveTargetError, ChangeMoveTargetError
} from "files/move/MoveActions"
import { Actions } from "actions"
import { ApiError } from "models/ApiError"

type EpicType = Epic<Actions, GlobalState, Dependencies>

export const moveEpic: EpicType = (
  action$: ActionsObservable<Move>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("Move")
    .mergeMap(({ fsNodeToMove, target }) => {
      const to = `${target.path === "/" ? "" : target.path}/${fsNodeToMove.name}`
      return dependencies.requests.move(fsNodeToMove.path, to)
        .map(movedfsNode => moveSuccess(fsNodeToMove, movedfsNode))
        .catch((error: ApiError) => Observable.of(moveError(error)))
    })
}

export const moveErrorEpic: EpicType = (action$: ActionsObservable<MoveError>) => {
  return action$.ofType("MoveError")
    .map(action => showApiErrorNotif(action.error))
}

export const changeMoveTargetEpic: EpicType = (
  action$: ActionsObservable<ChangeMoveTarget>,
  store: MiddlewareAPI<GlobalState>,
  dependencies: Dependencies,
) => {
  return action$.ofType("ChangeMoveTarget")
    .mergeMap(({ path }) =>
      dependencies.requests.fetchDirectory(path)
        .map(changeMoveTargetSuccess)
        .catch((error: ApiError) => Observable.of(changeMoveTargetError(error)))
    )
}

export const changeMoveTargetErrorEpic: EpicType = (action$: ActionsObservable<ChangeMoveTargetError>) => {
  return action$
    .ofType("ChangeMoveTargetError")
    .map(action => showApiErrorNotif(action.error))
}

export const moveEpics = combineEpics(
  moveEpic, moveErrorEpic,
  changeMoveTargetEpic, changeMoveTargetErrorEpic
)
