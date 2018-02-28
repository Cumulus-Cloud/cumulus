import { Epic, combineEpics } from "redux-observable"
import { GlobalState } from "store"
import * as Api from "services/Api"
import * as MoveActions from "move/MoveActions"
import { showErrorNotif } from "inAppNotif/InAppNotifActions"

// tslint:disable-next-line:no-any
export const moveEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("Move")
    .mergeMap(action => {
      const fsNodeToMove = state.getState().move.fsNodes[0]
      const target = state.getState().move.target!
      return Api.move(fsNodeToMove, target)
        .then(movedfsNode => MoveActions.moveSuccess(fsNodeToMove, movedfsNode))
        .catch(MoveActions.moveError)
    })

// tslint:disable-next-line:no-any
export const moveErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("MoveError")
    .map((action: MoveActions.MoveError) => showErrorNotif(action.error.message))

// tslint:disable-next-line:no-any
export const changeMoveTargetEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("ChangeMoveTarget")
    .mergeMap((action: MoveActions.ChangeMoveTarget) =>
      Api.fetchDirectory(action.path)
        .then(MoveActions.changeMoveTargetSuccess)
        .catch(MoveActions.changeMoveTargetError)
    )

// tslint:disable-next-line:no-any
export const changeMoveTargetErrorEpic: Epic<any, GlobalState> = (action$, state) => action$.ofType("ChangeMoveTargetError")
    .map((action: MoveActions.ChangeMoveTargetError) => showErrorNotif(action.error.message))

export const moveEpics = combineEpics(
  moveEpic, moveErrorEpic,
  changeMoveTargetEpic, changeMoveTargetErrorEpic
)
