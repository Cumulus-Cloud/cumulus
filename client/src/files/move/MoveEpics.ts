import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import {
  Move, MoveError, ChangeMoveTarget, moveSuccess, moveError, changeMoveTargetSuccess, changeMoveTargetError, ChangeMoveTargetError, MoveAction
} from "files/move/MoveActions"

export const moveEpic: Epic<MoveAction, GlobalState> = (action$: ActionsObservable<Move>) => action$.ofType("Move")
    .mergeMap(action => {
      const { fsNodeToMove, target } = action
      const to = `${target.path === "/" ? "" : target.path}/${fsNodeToMove.name}`
      return Api.move(fsNodeToMove.path, to)
        .then(movedfsNode => moveSuccess(fsNodeToMove, movedfsNode))
        .catch(moveError)
    })

export const moveErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<MoveError>) => action$.ofType("MoveError")
    .map(action => showApiErrorNotif(action.error))

export const changeMoveTargetEpic: Epic<MoveAction, GlobalState> = (action$: ActionsObservable<ChangeMoveTarget>) => {
  return action$.ofType("ChangeMoveTarget")
    .mergeMap(action =>
      Api.fetchDirectory(action.path)
        .then(changeMoveTargetSuccess)
        .catch(changeMoveTargetError)
    )
}

export const changeMoveTargetErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<ChangeMoveTargetError>) => {
  return action$
    .ofType("ChangeMoveTargetError")
    .map(action => showApiErrorNotif(action.error))
}

export const moveEpics = combineEpics(
  moveEpic, moveErrorEpic,
  changeMoveTargetEpic, changeMoveTargetErrorEpic
)
