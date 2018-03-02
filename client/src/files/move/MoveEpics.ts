import { Epic, combineEpics, ActionsObservable } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import { showApiErrorNotif } from "inAppNotif/InAppNotifActions"
import {
  Move, MoveError, ChangeMoveTarget, moveSuccess, moveError, changeMoveTargetSuccess, changeMoveTargetError, ChangeMoveTargetError
} from "files/move/MoveActions"

export const moveEpic: Epic<any, GlobalState> = (action$: ActionsObservable<Move>, state) => action$.ofType("Move")
    .mergeMap(action => {
      const fsNodeToMove = state.getState().move.fsNodes[0]
      const target = state.getState().move.target!
      return Api.move(fsNodeToMove.path, `${target.path === "/" ? "" : target.path}/${fsNodeToMove.name}`)
        .then(movedfsNode => moveSuccess(fsNodeToMove, movedfsNode))
        .catch(moveError)
    })

export const moveErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<MoveError>) => action$.ofType("MoveError")
    .map(action => showApiErrorNotif(action.error))

export const changeMoveTargetEpic: Epic<any, GlobalState> = (action$: ActionsObservable<ChangeMoveTarget>) => action$.ofType("ChangeMoveTarget")
    .mergeMap(action =>
      Api.fetchDirectory(action.path)
        .then(changeMoveTargetSuccess)
        .catch(changeMoveTargetError)
    )

export const changeMoveTargetErrorEpic: Epic<any, GlobalState> = (action$: ActionsObservable<ChangeMoveTargetError>) => {
  return action$
    .ofType("ChangeMoveTargetError")
    .map(action => showApiErrorNotif(action.error))
}

export const moveEpics = combineEpics(
  moveEpic, moveErrorEpic,
  changeMoveTargetEpic, changeMoveTargetErrorEpic
)
